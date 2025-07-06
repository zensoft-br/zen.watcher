import * as Z from "@zensoftbr/zenerpclient";

export async function userLogCreate(zenReq) {
  // Checks if the event is related to user log creation and if it's the "after" event.
  if (zenReq.body?.context?.event !== "/system/audit/userLogCreate")
    return;

  if (!(zenReq.body?.context?.tags ?? []).includes("after"))
    return;

  // Extracting necessary information from the request body
  const body = zenReq.body;
  const args = body.args.args;

  // Checking if the "notify-commercial" tag is present in the arguments, if not, return early
  if (!(args.tags ?? []).includes("notify-commercial"))
    return;

  // Checking if the source starts with "/sale/sale:", if not, return early
  if (!args.source?.startsWith("/sale/sale:"))
    return;

  // Creating a client using token information from the request context
  const client = Z.createFromToken(body.context.tenant, process.env.token);

  // Creating a sale service instance
  const saleService = new Z.api.sale.SaleService(client);

  // Fetching sale details by ID extracted from the source
  const sale = await saleService.saleReadById(args.source.substring(11));

  // If sale details or the email of the salesperson associated with the sale is not available, return early
  if (!sale?.personSalesperson?.email)
    return;

  // Creating a security service instance
  const securityService = new Z.api.system.security.SecurityService(client);

  // Fetching current session details
  const session = await securityService.sessionOpGetCurrent();

  // Creating a mail message instance
  const message = new Z.api.system.mail.Message();

  // Setting message details like sender, recipient, subject, content, etc.
  message.from = { description: sale.company.person.name };
  message.to = [{ address: sale.personSalesperson.email }];
  message.repplyTo = [{ address: session.user.code, description: session.user.description }];
  message.subject = `Pedido de venda ${sale.code ?? sale.id}, ${sale.person.name}`;
  message.content = `Você tem uma nova mensagem sobre o pedido de venda ${sale.code ?? sale.id}:\n\n${args.content}\n\nZen Erp ®`;
  message.mimeType = "text/plain; charset=utf-8";

  // Creating a mail service instance
  const mailService = new Z.api.system.mail.MailService(client);

  // Sending the message via the mail service
  await mailService.messageOpSend(null, "pamela", message);

  return {
    statusCode: 200,
  };
}