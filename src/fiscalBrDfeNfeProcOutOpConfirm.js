import Z from "@zensoft-br/zenclient";

/**
 * Query params:
 * tenant
 * recipients: company,person,salesperson,shipping (many)
 * email: force e-mail
 */
export async function emailNFe(zenReq) {
  // We will get tenant from query for now
  const tenant = zenReq.query?.tenant;

  // Recipients who should receive e-mails
  const recipients = (zenReq.query?.recipients ?? "company,person,salesperson,shipping").toLowerCase().split(",");

  const z = Z.createFromToken(tenant, zenReq.body.context.token);

  const fiscalBrService = new Z.api.fiscal.br.Service(z);
  const mailService = new Z.api.system.mail.Service(z);
  const personService = new Z.api.catalog.person.Service(z);
  const i18n = await z.i18n;

  // Load NFe
  const dfeNfeProcOut = await fiscalBrService.dfeNfeProcOutReadById(zenReq.body.args.id);
  const outgoingInvoice = dfeNfeProcOut.outgoingInvoice;

  // Let's load all personContact's in just on read
  const personIds = [];
  if (recipients.includes("company"))
    personIds.push(outgoingInvoice.company.person.id);
  if (recipients.includes("person"))
    personIds.push(outgoingInvoice.person.id);
  if (recipients.includes("salesperson") && outgoingInvoice.personSalesperson)
    personIds.push(outgoingInvoice.personSalesperson.id);
  if (recipients.includes("shipping") && outgoingInvoice.personShipping)
    personIds.push(outgoingInvoice.personShipping.id);
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

  if (!personContactList.length)
    return;

  // Fetch XML and DANFE
  const xml = await fetch(dfeNfeProcOut.file.url);
  const danfe = await fetch(dfeNfeProcOut.fileDanfe.url);

  // Convert XML and DANFE to base64 strings
  const xmlBytes = Buffer.from(await xml.arrayBuffer()).toString("base64");
  const danfeBytes = Buffer.from(await danfe.arrayBuffer()).toString("base64");

  // Send the e-mails
  // TODO Do not await
  await mailService.messageOpSend({
    from: {
      description: outgoingInvoice.company.person.name,
    },
    to: personContactList
      .map(e => ({
        address: zenReq.query?.email ?? e.description,
        description: e.person.name,
      }),
      ),
    subject: i18n.format(
      "@@:/fiscal/outgoingInvoice/identified",
      outgoingInvoice.number,
    ),
    content: `
      Você está recebendo uma nota fiscal eletrônica.

      Emitente: ${outgoingInvoice.company.person.name}
      CNPJ: ${outgoingInvoice.company.person.documentNumber}
      Destinatário: ${outgoingInvoice.person.name}
      CNPJ: ${outgoingInvoice.person.documentNumber}
      Número: ${outgoingInvoice.number}
      Chave de acesso: ${dfeNfeProcOut?.chNFe}

      Para maiores detalhes, consulte esta nota fiscal eletrônica no link:
      https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=completa&tipoConteudo=7PhJ+gAVw2g=

      Zen Erp ®
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
    source: `/fiscal/outgoingInvoice:${outgoingInvoice.id}`,
  });
}