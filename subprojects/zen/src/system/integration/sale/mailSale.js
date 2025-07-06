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

  const bean = await saleService.saleReadById(id);
  if (!bean)
    return;

  // Let's load all personContact's in just on read
  const personIds = [];
  if (recipients.includes("company"))
    personIds.push(bean.company.person.id);
  if (recipients.includes("person"))
    personIds.push(bean.person.id);
  if (recipients.includes("salesperson") && bean.personSalesperson)
    personIds.push(bean.personSalesperson.id);
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
  if (bean.company.properties?.mailerConfig_commercial_sale) {
    const mailerConfig = await mailService.mailerConfigReadById(bean.company.properties?.mailerConfig_commercial_sale);
    mailerConfig_code = mailerConfig?.code;
  }

  const report = await reportService.reportOpPrint({
    code: "/sale/report/saleForm",
    parameters: {
      ids: [bean.id],
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
  await mailService.messageOpSend(null, mailerConfig_code, {
    from: {
      description: bean.company.person.name,
    },
    to,
    subject: `Confirmação de recebimento do pedido ${bean.code ?? bean.id}`,
    content: `
      Prezado(a) ${bean.person.name},

      Recebemos o seu pedido ${bean.code ?? bean.id} em ${i18n.formatDate(bean.date)} e já estamos processando.

      Caso tenha alguma dúvida, entre em contato conosco.

      Agradecemos a sua preferência!

      Atenciosamente,
      ${bean.company.person.name}
      CNPJ: ${bean.company.person.documentNumber}
      
      Zen ERP ®
      `,
    mimeType: "text/plain;charset=utf-8",
    attachments: [
      {
        identifier: `${i18n.format("/sale/sale/identified", bean.id)}.pdf`,
        bytes: report.content,
        mimeType: report.contentType,
      },
    ],
    source: `/sale/sale:${bean.id}`,
  });
}