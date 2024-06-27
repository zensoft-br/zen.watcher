import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function saleOpApprove(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const saleService = new Z.api.sale.SaleService(z);

  const id = zenReq.body.args.id;

  const saleItemList = await saleService.saleItemRead(`q=sale.id==${id}`);
  let totalValuePriceList = 0;
  let totalValue = 0;
  for (const saleItem of saleItemList) {
    totalValuePriceList += saleItemList[0].quantity * (saleItemList[0].properties.unitValuePriceList ?? saleItemList[0].unitValue);
    totalValue += saleItemList[0].quantity * saleItemList[0].unitValue;
  }
  if (totalValue / totalValuePriceList < 0.85)
    throw new Error(`O desconto concedido no pedido ${id} está acima do limite permitido. Solicite aprovação especial`);
}