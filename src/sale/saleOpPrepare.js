import "dotenv/config";
import { createFromToken } from "@zensoftbr/zenerpclient";
import { SaleService } from "@zensoftbr/zenerpclient/api/sale/SaleService";

export async function saleOpPrepare(zenReq) {
  if (zenReq.body?.context?.event !== "/sale/saleOpPrepare")
    return;

  if (!(zenReq.body?.context?.tags ?? []).includes("before"))
    return;

  const id = zenReq.body.args.id;

  const z = createFromToken(zenReq.body.context.tenant, process.env.token);

  const saleService = new SaleService(z);

  const sale = await saleService.saleReadById(id);
  const salePaymentList = await saleService.salePaymentRead(`q=sale.id==${id}`);

  // Pedido antecipado
  if (salePaymentList.length == 1 && salePaymentList[0].term == 0) {
    // Adiciona a tag antecipado
    sale.tags = (sale.tags ?? "").split(",").filter((e) => e).concat("antecipado").join(",");

    await saleService.saleUpdate(sale);
  }
}