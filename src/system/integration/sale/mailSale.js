import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

/**
 * Query params:
 * tenant
 * recipients: company,person,salesperson,shipping (many)
 * email: force e-mail
 */
export async function mailSale(z, id, args) {
  // Recipients who should receive e-mails
  const recipients = (args?.recipients ?? "person,salesperson").toLowerCase().split(",");

  const i18n = await z.i18n;

  const personService = new Z.api.catalog.person.PersonService(z);
  const mailService = new Z.api.system.mail.MailService(z);
  const reportService = new Z.api.system.report.ReportService(z);
  const saleService = new Z.api.sale.SaleService(z);

  const sale = await saleService.saleReadById(id);

  // Let's load all personContact's in just on read
  const personIds = [];
  if (recipients.includes("company"))
    personIds.push(sale.company.person.id);
  if (recipients.includes("person"))
    personIds.push(sale.person.id);
  if (recipients.includes("salesperson") && sale.personSalesperson)
    personIds.push(sale.personSalesperson.id);
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

  let mailerConfig_code = undefined;
  if (sale.company.properties?.mailerConfig_fiscal_outgoingInvoice) {
    const mailerConfig = await mailService.mailerConfigReadById(sale.company.properties?.mailerConfig_fiscal_outgoingInvoice);
    mailerConfig_code = mailerConfig?.code;
  }

  const report = await reportService.reportOpPrint({
    code: "/sale/report/saleForm",
    parameters: {
      ids: [sale.id],
    },
    format: "PDF",
  });

  const to = personContactList
    .map(e => ({
      address: e.description,
      description: e.person.name,
    }),
    );

  // Send the e-mails
  // TODO
  await mailService.messageOpSend(null, mailerConfig_code, {
    from: {
      description: sale.company.person.name,
    },
    to,
    // TODO
    bcc: [{
      address: "fabiano.bonin@personalsoft.com.br",
    }],
    // TODO
    // subject: i18n.format(
    //   "@@:/fiscal/outgoingInvoice/identified",
    //   sale.number,
    // ),
    subject: `Confirmação de recebimento do pedido ${sale.code ?? sale.id}`,
    content: `
      Prezado(a) ${sale.person.name},

      Recebemos o seu pedido ${sale.code ?? sale.id} em ${i18n.formatDate(sale.date)} e já estamos processando.

      Caso tenha alguma dúvida, entre em contato conosco.

      Agradecemos a sua preferência!

      Atenciosamente,
      ${sale.company.person.name}
      CNPJ: ${sale.company.person.documentNumber}
      
      Zen ERP ®
      `,
    mimeType: "text/plain;charset=utf-8",
    attachments: [
      {
        identifier: `${i18n.format("/sale/sale/identified", sale.id)}.pdf`,
        bytes: report.content,
        mimeType: report.contentType,
      },
    ],
    source: `/sale/sale:${sale.id}`,
  });
}