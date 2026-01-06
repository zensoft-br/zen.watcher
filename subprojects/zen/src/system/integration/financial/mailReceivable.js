import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

/**
 * Query params:
 * tenant
 * recipients: company,person,salesperson,shipping (many)
 * email: force e-mail
 */
export async function mailReceivable(z, id, args) {
  // Recipients who should receive e-mails
  const recipients = (args?.recipients ?? "person").toLowerCase().split(",");

  const i18n = await z.i18n;

  const financialService = new Z.api.financial.FinancialService(z);
  const personService = new Z.api.catalog.person.PersonService(z);
  const mailService = new Z.api.system.mail.MailService(z);
  const reportService = new Z.api.system.report.ReportService(z);

  // Load receivable
  const bean = await financialService.receivableReadById(id);
  if (!bean) {
    return;
  }

  // Let's load all personContact's in just on read
  const personIds = [];
  if (recipients.includes("company")) {
    personIds.push(bean.company.person.id);
  }
  if (recipients.includes("person")) {
    personIds.push(bean.person.id);
  }
  if (recipients.includes("salesperson") && bean.invoice?.personSalesperson) {
    personIds.push(bean.invoice.personSalesperson.id);
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
    // Contacts with "billing" tag
    e.tags.includes("billing")
    // Or contacts with "#default" tag if there is no contact with "billing" tag for the person
    || (!arr.find(e1 => e1.person.id == e.person.id && e1.tags.includes("billing")) && e.tags.includes("#default")));

  if (!personContactList.length) {
    return;
  }

  let mailerConfig_code = undefined;
  if (bean.company.properties?.mailerConfig_financial_receivable) {
    const mailerConfig = await mailService.mailerConfigReadById(bean.company.properties?.mailerConfig_financial_receivable);
    mailerConfig_code = mailerConfig?.code;
  }

  const report = await reportService.reportOpPrint({
    code: "/financial/report/receivableForm",
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

    Nota fiscal: ${bean.invoice?.number ?? ""}
    Valor: ${i18n.formatCurrency(bean.invoice?.totalValue ?? null) ?? ""}

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
}