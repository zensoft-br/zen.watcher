import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function saleOpApprove(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const financialService = new Z.api.financial.FinancialService(z);
  const saleService = new Z.api.sale.SaleService(z);

  const sale = await saleService.saleReadById(zenReq.body.args.id);

  // If today is a monday, consider past friday as the base date
  var date = new Date();
  if (date.getDay() === 1) {
    date.setDate(date.getDate() - 2);
  }

  // Find overdue receivables
  const receivableList = await financialService.receivableRead(
    `q=(person.id==${sale.person.id},person.personGroup.id==${sale.person.personGroup?.id ?? 0});status==APPROVED;dueDate<${date.toISOString().substring(0, 10)}`,
  );
  if (receivableList.length)
    throw new Error(`O cliente possui ${receivableList.length} título(s) vencido(s)\nSolicite aprovação de um operador com a permissão $act/aprovarNotasFiscaisDeSaidaComRestricoes`);
}