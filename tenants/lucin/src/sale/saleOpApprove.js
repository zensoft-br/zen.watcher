import * as Z from "@zensoftbr/zenerpclient";
import "dotenv/config";

export async function saleOpApprove(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const saleService = new Z.api.sale.SaleService(z);

  const sale = await saleService.saleReadById(zenReq.body.args.id);

  if (!sale.person.properties?.paymentMethods || !sale.person.category2) {
    throw new Error("Informações cadastrais incompletas");
  }
}
