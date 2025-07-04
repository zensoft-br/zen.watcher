import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function outgoingInvoiceOpPrepare(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);
  const z1 = Z.createFromToken(zenReq.body.context.tenant, zenReq.body.context.token);

  const financialService = new Z.api.financial.FinancialService(z);
  const fiscalService = new Z.api.fiscal.FiscalService(z);
  const securityService = new Z.api.system.security.SecurityService(z1);

  const outgoingInvoice = await fiscalService.outgoingInvoiceReadById(zenReq.body.args.id);

  // Check if the user is privileged
  const privileged = await securityService.accessPointOpValidate("$act/aprovarNotasFiscaisDeSaidaComRestricoes");
  if (privileged)
    return;

  // If today is a monday, consider past friday as the base date
  var date = new Date();
  if (date.getDay() === 1) {
    date.setDate(date.getDate() - 2);
  }

  // Find overdue receivables
  const receivableList = await financialService.receivableRead(
    `q=person.id==${outgoingInvoice.person.id};status==APPROVED;dueDate<${date.toISOString().substring(0, 10)}`,
  );
  if (receivableList.length)
    throw new Error(`O cliente possui ${receivableList.length} título(s) vencido(s)\nSolicite aprovação de um operador com a permissão $act/aprovarNotasFiscaisDeSaidaComRestricoes`);
}