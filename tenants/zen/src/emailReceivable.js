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

  const billingService = new Z.api.financial.billing.BillingService(z);
  const personService = new Z.api.catalog.person.PersonService(z);
  const i18n = await z.i18n;

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

  // Fetch XML and DANFE
  const result = await z.web.fetchJson("/system/report/reportOpPrint", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      code: "/financial/report/receivableForm",
      format: "PDF",
      parameters: {
        ids: [bean.id],
      },
    }),
  });

  const sp = new URLSearchParams();
  if (zenReq.mailerConfigMap?.[bean.company.code])
    sp.set("mailerConfigCode", zenReq.mailerConfigMap[bean.company.code]);
  else if (bean.company.mailerConfig)
    sp.set("mailerConfigId", bean.company.mailerConfig.id);

  // Send the e-mails
  await z.web.fetchOk(`/system/mail/messageOpSend?${sp.toString()}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: {
        description: bean.company.person.name,
      },
      to: personContactList
        .map(e => ({
          address: zenReq.query?.email ?? e.description,
          description: e.person.name,
        }),
        ),
      subject: `O seu boleto chegou! Número ${bean.code ?? bean.id
      }, vencimento ${i18n.formatDate(bean.dueDate)}`,
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
          identifier: `${bean.code ?? bean.id }.pdf`,
          bytes: result.content,
          mimeType: result.contentType,
        },
      ],
      source: `/financial/receivable:${bean.id}`,
    }),
  });
}