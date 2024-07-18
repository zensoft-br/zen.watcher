import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function outgoingInvoiceOpApprove(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const financialService = new Z.api.financial.FinancialService(z);
  const fiscalService = new Z.api.fiscal.FiscalService(z);
  const securityService = new Z.api.system.security.SecurityService(z);

  const outgoingInvoice = await fiscalService.outgoingInvoiceReadById(zenReq.body.args.id);

  // Check if the user is privileged
  const privileged = await securityService.accessPointOpValidate("$act/aprovarNotasFiscaisDeSaidaComRestricoes");
  if (privileged)
    return;

  // Find overdue receivables
  const receivableList = await financialService.receivableRead(
    `q=person.id==${outgoingInvoice.person.id};status==APPROVED;dueDate<${new Date().toISOString().substring(0, 10)}`,
  );
  if (receivableList.length)
    throw new Error(`O cliente possui ${receivableList.length} título(s) vencido(s)\nSolicite aprovação de um operador com a permissão $act/aprovarNotasFiscaisDeSaidaComRestricoes`);
}