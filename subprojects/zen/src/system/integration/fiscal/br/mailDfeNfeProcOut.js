import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

/**
 * Query params:
 * tenant
 * recipients: company,person,salesperson,shipping (many)
 * email: force e-mail
 */
export async function mailDfeNfeProcOut(z, id, args) {
  // Recipients who should receive e-mails
  const recipients = (args?.recipients ?? "person,salesperson,shipping").toLowerCase().split(",");

  const i18n = await z.i18n;

  const fiscalBrService = new Z.api.fiscal.br.FiscalBrService(z);
  const personService = new Z.api.catalog.person.PersonService(z);
  const mailService = new Z.api.system.mail.MailService(z);

  // Load NFe
  const dfeNfeProcOut = await fiscalBrService.dfeNfeProcOutReadById(id);
  if (!dfeNfeProcOut)
    throw new Error(`dfeNfeProcOut ${id} not found`);
  if (dfeNfeProcOut.status !== "PROCESSED")
    return;

  const invoice = dfeNfeProcOut.invoice ?? dfeNfeProcOut.outgoingInvoice;

  // Let's load all personContact's in just on read
  const personIds = [];
  if (recipients.includes("company"))
    personIds.push(invoice.company.person.id);
  if (recipients.includes("person"))
    personIds.push(invoice.person.id);
  if (recipients.includes("salesperson") && invoice.personSalesperson)
    personIds.push(invoice.personSalesperson.id);
  if (recipients.includes("shipping") && invoice.personShipping)
    personIds.push(invoice.personShipping.id);
  if (!personIds.length)
    throw new Error("Empty recipients");

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
    throw new Error(`No e-mails available for person ${invoice.person.id}`);
  }

  // Fetch XML and DANFE
  const xml = await fetch(dfeNfeProcOut.file.url);
  const danfe = await fetch(dfeNfeProcOut.fileDanfe.url);

  // Convert XML and DANFE to base64 strings
  const xmlBytes = Buffer.from(await xml.arrayBuffer()).toString("base64");
  const danfeBytes = Buffer.from(await danfe.arrayBuffer()).toString("base64");

  let mailerConfig_code = undefined;
  if (invoice.company.properties?.mailerConfig_fiscal_outgoingInvoice) {
    const mailerConfig = await mailService.mailerConfigReadById(invoice.company.properties?.mailerConfig_fiscal_outgoingInvoice);
    mailerConfig_code = mailerConfig?.code;
  }

  const to = personContactList
    .map(e => ({
      address: e.description,
      description: e.person.name,
    }),
    );

  // Send the e-mails
  await mailService.messageOpSend(null, mailerConfig_code, {
    from: {
      description: invoice.company.person.name,
    },
    to,
    // bcc: null,
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
        identifier: `${dfeNfeProcOut.chNFe}.DANFE.pdf`,
        bytes: danfeBytes,
        mimeType: "application/pdf",
      },
      {
        identifier: `${dfeNfeProcOut.chNFe}.nfeProc.xml`,
        bytes: xmlBytes,
        mimeType: "application/xml",
      },
    ],
    source: `/fiscal/outgoingInvoice:${invoice.id}`,
  });
}

// const z = Z.createFromToken("lucin", "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIzMWM5NzM4YS02NTg5LTRiNDYtOWQ1Ny0yY2RjZDc5NTM4MWIiLCJzdWIiOiJzdXBwb3J0QHBlcnNvbmFsc29mdC5jb20uYnIiLCJuYmYiOjE3NDE0MTQwNDEsImlhdCI6MTc0MTQxNDA0MSwiZXhwIjoxNzQxNTAwNDQxLCJsb2NhbGUiOiJwdC1CUiIsInRpbWVab25lIjoiQW1lcmljYS9TYW9fUGF1bG8ifQ.d6o7u5JfIbNDL_3iJ9G7SpTwJuftrJIH9ReIjAD5OWY");
// const idList = [
//   1237, 1238, 1242, 1450, 1640, 1869, 1870, 1885, 4628, 4722, 4773, 4951, 5145, 5146, 5147, 5151,
// ];
// console.log(idList.length);
// for (const id of idList) {
//   try {
//     await emailNFe(z, id);
//   } catch (error) {
//     console.error(id, error);
//   }
// }