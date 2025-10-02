import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function saleOpPrepare(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const id = zenReq.body.args.id;
  const saleService = new Z.api.sale.SaleService(z);
  const sale = await saleService.saleReadById(id);
  if ((sale?.tags ?? []).includes("lead")) {
    throw new Error(`Não é permito finalizar a preparação de pedidos que contenham a tag "lead" (ID: ${id}).`);
  }
}

