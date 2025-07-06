import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

/**
 * Ajuste de produtos com redução na base de cálculo das comissões
 */
export async function saleOpPrepare(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const saleService = new Z.api.sale.SaleService(z);

  const sale = await saleService.saleReadById(zenReq.body.args.id);
  const saleItemList = await saleService.saleItemRead(`q=sale.id==${sale.id}`);

  for (const saleItem of saleItemList) {
    if (saleItem.productPacking.product.properties?.salesCommissionReduction) {
      let salesCommission = saleItem.properties?.salesCommission ?? sale.properties?.salesCommission ?? 0;
      salesCommission = salesCommission * (1 - saleItem.productPacking.product.properties?.salesCommissionReduction / 100);
      saleItem.properties = {
        ...saleItem.properties,
        salesCommission,
      };

      await saleService.saleItemUpdate(saleItem);
    }
  }

  return zenRes;
}
