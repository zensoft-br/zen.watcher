import Z from "@zensoft-br/zenclient";

/**
 * Query params:
 * tenant
 * recipients: company,person,salesperson,shipping (many)
 * email: force e-mail
 */
export async function emailReceivable(zenReq) {
  // Recipients who should receive e-mails
  const recipients = (zenReq.query?.recipients ?? "company,person").toLowerCase().split(",");

  const z = Z.createFromToken(zenReq.body.context.tenant, zenReq.body.context.token);

  const billingService = new Z.api.financial.billing.Service(z);
  const personService = new Z.api.catalog.person.Service(z);
  const i18n = await z.i18n;

  // Load NFe
  const instructionResponse = await billingService.instructionResponseReadById(zenReq.body.args.id);
  if (instructionResponse.type !== "REGISTERED")
    return;

  const receivable = instructionResponse.billingTitle;
  if (!receivable)
    return;

  // Let's load all personContact's in just on read
  const personIds = [];
  if (recipients.includes("company"))
    personIds.push(receivable.company.person.id);
  if (recipients.includes("person"))
    personIds.push(receivable.person.id);
  if (recipients.includes("salesperson") && receivable.outgoingInvoice?.personSalesperson)
    personIds.push(receivable.personSalesperson.id);
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
  const blob = await z.web.fetchBlob("/system/report/reportOpGenerate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      code: "/financial/report/bankslip",
      format: "PDF",
      dataSource: {
        code: "/financial/report/bankslip",
        parameters: {
          IDS: `{${receivable.id}}`,
        },
      },
    }),
  });

  // Convert XML and DANFE to base64 strings
  const bankslipBytes = Buffer.from(await blob.arrayBuffer()).toString("base64");

  // mailerConfig=EMP1:MC1,EMP2:MC2
  const mailerConfigMap = (zenReq.query.mailerConfig ?? "")
    .split(",")
    .filter(e => e)
    .reduce((red, e) => {
      const pair = e.split("=");
      red[pair[0]] = pair[1];
      return red;
    }, {});
  const sp = new URLSearchParams();
  if (mailerConfigMap[receivable.company.code])
    sp.set("mailerConfigCode", mailerConfigMap[receivable.company.code]);
  else if (receivable.company.mailerConfig)
    sp.set("mailerConfigId", receivable.company.mailerConfig.id);

  // Send the e-mails
  await z.web.fetchOk(`/system/mail/messageOpSend?${sp.toString()}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: {
        description: receivable.company.person.name,
      },
      to: personContactList
        .map(e => ({
          address: zenReq.query?.email ?? e.description,
          description: e.person.name,
        }),
        ),
      subject: `O seu boleto chegou! Número ${receivable.code ?? receivable.id
      }, vencimento ${i18n.formatDate(receivable.dueDate)}`,
      content: `
      Você está recebendo um boleto.

      Emitente: ${receivable.company.person.name}
      CNPJ: ${receivable.company.person.documentNumber}

      Destinatário: ${receivable.person.name}
      CNPJ: ${receivable.person.documentNumber}

      Número: ${receivable.code}
      Emissão: ${i18n.formatDate(receivable.issueDate)}
      Vencimento: ${i18n.formatDate(receivable.dueDate)}
      Valor: ${i18n.formatCurrency(receivable.value)}

      Nota fiscal: ${receivable.outgoingInvoice?.number ?? ""}
      Valor: ${i18n.formatCurrency(receivable.outgoingInvoice?.totalValue ?? null) ?? ""}

      Zen Erp ®
      `,
      mimeType: "text/plain;charset=utf-8",
      attachments: [
        {
          identifier: `${receivable.code ?? receivable.id }.pdf`,
          bytes: bankslipBytes,
          mimeType: "application/pdf",
        },
      ],
      source: `/financial/receivable:${receivable.id}`,
    }),
  });
}