import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function saleOpApprove(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const saleService = new Z.api.sale.SaleService(z);

  const sale = await saleService.saleReadById(zenReq.body.args.id);

  /*
   * Quando um pedido de venda é aprovado,
   * os itens do pedido são alimentados no estoque.
   */
  
}