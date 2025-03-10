import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

/**
 * Query params:
 * tenant
 * recipients: company,person,salesperson,shipping (many)
 * email: force e-mail
 */
export async function emailReceivable(zenReq) {
  // Recipients who should receive e-mails
  const recipients = (zenReq.query?.recipients ?? "company,person").toLowerCase().split(",");

  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const i18n = await z.i18n;

  const billingService = new Z.api.financial.billing.BillingService(z);
  const personService = new Z.api.catalog.person.PersonService(z);
  const mailService = new Z.api.system.mail.MailService(z);
  const reportService = new Z.api.system.report.ReportService(z);

  // Load NFe
  const instructionResponse = await billingService.instructionResponseReadById(zenReq.body.args.id);
  if (instructionResponse.type !== "REGISTERED")
    return;

  const bean = instructionResponse.billingTitle;
  if (!bean)
    return;

  // Let's load all personContact's in just on read
  const personIds = [];
  if (recipients.includes("company"))
    personIds.push(bean.company.person.id);
  if (recipients.includes("person"))
    personIds.push(bean.person.id);
  if (recipients.includes("salesperson") && bean.outgoingInvoice?.personSalesperson)
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
    // Contacts with "billing" tag
    e.tags.includes("billing")
    // Or contacts with "#default" tag if there is no contact with "billing" tag for the person
    || (!arr.find(e1 => e1.person.id == e.person.id && e1.tags.includes("billing")) && e.tags.includes("#default")));

  if (!personContactList.length)
    return;

  const report = await reportService.reportOpPrint({
    code: "/financial/report/receivableForm",
    parameters: {
      ids: [bean.id],
    },
    format: "PDF",
  });
  console.log(`${new Date().toISOString()} reportService.reportOpPrint()`);

  const sp = new URLSearchParams();
  if (zenReq.mailerConfigMap?.[bean.company.code])
    sp.set("mailerConfigCode", zenReq.mailerConfigMap[bean.company.code]);
  else if (bean.company.mailerConfig)
    sp.set("mailerConfigId", bean.company.mailerConfig.id);

  const mailerConfigCode = bean.company.code.startsWith("L/") ? "LUCIN/BOLETO" : "NOVAX/BOLETO";

  const to = personContactList
    .map(e => ({
      address: zenReq.query?.email ?? e.description,
      description: e.person.name,
    }),
    );

  // Send the e-mails
  await mailService.messageOpSend(null, mailerConfigCode, {
    from: {
      description: bean.company.person.name,
    },
    to,
    // TODO
    bcc: [{
      address: "fabiano.bonin@personalsoft.com.br",
    }],
    subject: `O seu boleto chegou! Número ${bean.code ?? bean.id}, vencimento ${i18n.formatDate(bean.dueDate)}`,
    content: `
    Você está recebendo um boleto.

    Emitente: ${bean.company.person.name}
    CNPJ: ${bean.company.person.documentNumber}

    Destinatário: ${bean.person.name}
    CNPJ: ${bean.person.documentNumber}

    Número: ${bean.code}
    Emissão: ${i18n.formatDate(bean.issueDate)}
    Vencimento: ${i18n.formatDate(bean.dueDate)}
    Valor: ${i18n.formatCurrency(bean.value)}

    Nota fiscal: ${bean.outgoingInvoice?.number ?? ""}
    Valor: ${i18n.formatCurrency(bean.outgoingInvoice?.totalValue ?? null) ?? ""}

    Zen ERP ®
    `,
    mimeType: "text/plain;charset=utf-8",
    attachments: [
      {
        identifier: `${bean.code ?? bean.id}.pdf`,
        bytes: report.content,
        mimeType: report.contentType,
      },
    ],
    source: `/financial/receivable:${bean.id}`,
  });

  console.log(`${new Date().toISOString()} mailService.messageOpSend()`);
}