import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

/**
 * Query params:
 * tenant
 * recipients: company,person,salesperson,shipping (many)
 * email: force e-mail
 */
export async function emailNFe(zenReq) {
  // Recipients who should receive e-mails
  const recipients = (zenReq.query?.recipients ?? "company,person,salesperson,shipping").toLowerCase().split(",");

  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const fiscalBrService = new Z.api.fiscal.br.FiscalBrService(z);
  const personService = new Z.api.catalog.person.PersonService(z);
  const i18n = await z.i18n;

  // Load NFe
  const dfeNfeProcOut = await fiscalBrService.dfeNfeProcOutReadById(zenReq.body.args.id);
  if (dfeNfeProcOut.status !== "PROCESSED") {
    return;
  }

  const invoice = (dfeNfeProcOut.invoice ?? dfeNfeProcOut.outgoingInvoice);

  // Let's load all personContact's in just on read
  const personIds = [];
  if (recipients.includes("company")) {
    personIds.push(invoice.company.person.id);
  }
  if (recipients.includes("person")) {
    personIds.push(invoice.person.id);
  }
  if (recipients.includes("salesperson") && invoice.personSalesperson) {
    personIds.push(invoice.personSalesperson.id);
  }
  if (recipients.includes("shipping") && invoice.personShipping) {
    personIds.push(invoice.personShipping.id);
  }
  if (!personIds.length) {
    throw new Error("Empty recipients");
  }

  // Get personContact's
  let personContactList = await personService.personContactRead(`q=type==EMAIL;(${personIds.map(e => `person.id==${e}`).join(",")})`);

  // Split tags, converting to array
  personContactList.forEach(e => {
    e.tags = (e.tags ?? "").split(",");
  });

  // Filter contacts
  personContactList = personContactList.filter((e, _, arr) =>
    // Contacts with "invoice" tag
    e.tags.includes("invoice")
    // Or contacts with "#default" tag if there is no contact with "invoice" tag for the person
    || (!arr.find(e1 => e1.person.id == e.person.id && e1.tags.includes("invoice")) && e.tags.includes("#default")));

  if (!personContactList.length) {
    return;
  }

  // Fetch XML and DANFE
  const xml = await fetch(dfeNfeProcOut.file.url);
  const danfe = await fetch(dfeNfeProcOut.fileDanfe.url);

  // Convert XML and DANFE to base64 strings
  const xmlBytes = Buffer.from(await xml.arrayBuffer()).toString("base64");
  const danfeBytes = Buffer.from(await danfe.arrayBuffer()).toString("base64");

  const sp = new URLSearchParams();
  if (zenReq.mailerConfigMap?.[invoice.company.code]) {
    sp.set("mailerConfigCode", zenReq.mailerConfigMap[invoice.company.code]);
  } else if (invoice.company.mailerConfig) {
    sp.set("mailerConfigId", invoice.company.mailerConfig.id);
  }

  // Send the e-mails
  await z.web.fetchOk(`/system/mail/messageOpSend?${sp.toString()}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: {
        description: invoice.company.person.name,
      },
      to: personContactList
        .map(e => ({
          address: zenReq.query?.email ?? e.description,
          description: e.person.name,
        }),
        ),
      subject: i18n.format(
        "@@:/fiscal/outgoingInvoice/identified",
        invoice.number,
      ),
      content: `
        Você está recebendo uma nota fiscal eletrônica.
  
        Emitente: ${invoice.company.person.name}
        CNPJ: ${invoice.company.person.documentNumber}

        Destinatário: ${invoice.person.name}
        CNPJ: ${invoice.person.documentNumber}

        Número: ${invoice.number}
        Chave de acesso: ${dfeNfeProcOut?.chNFe}
  
        Para maiores detalhes, consulte esta nota fiscal eletrônica no link:
        https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=completa&tipoConteudo=7PhJ+gAVw2g=
  
        Zen ERP ®
        `,
      mimeType: "text/plain;charset=utf-8",
      attachments: [
        {
          identifier: `${dfeNfeProcOut.chNFe }.DANFE.pdf`,
          bytes: danfeBytes,
          mimeType: "application/pdf",
        },
        {
          identifier: `${dfeNfeProcOut.chNFe }.nfeProc.xml`,
          bytes: xmlBytes,
          mimeType: "application/xml",
        },
      ],
      source: `/fiscal/outgoingInvoice:${invoice.id}`,
    }),
  });
}