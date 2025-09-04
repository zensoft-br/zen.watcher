import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function saleOpApprove(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

  // const z = Z.createFromToken(zenReq.body.context.tenant, zenReq.body.context.token);
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const dataService = new Z.api.system.data.DataService(z);
  const saleService = new Z.api.sale.SaleService(z);

  const sale = await saleService.saleReadById(zenReq.body.args.id);
  const saleItemList = await saleService.saleItemRead(`q=sale.id==${sale.id}`);

  for (const saleItem of saleItemList) {
    const saleList = await dataService.dataSourceOpRead({
      code: "/sale/report/saleCube",
      parameters: {
        COMPANY_IDS: `{${sale.company.id}}`,
        PRODUCT_PACKING_IDS: `{${saleItem.productPacking.id}}`,
        STATUS_LIST: "{\"APPROVED\", \"PICKING\"}",
      },
    });

    const stockList = await dataService.dataSourceOpRead({
      code: "/material/report/stockCube",
      parameters: {
        STATUS_LIST: "{\"FREE\", \"FUTURE\"}",
        TYPE_LIST: "{\"REGULAR\"}",
        STOCK_CLUSTER_IDS: `{${sale.company.stockCluster.id}}`,
        PRODUCT_PACKING_IDS: `{${saleItem.productPacking.id}}`,
      },
    });

    const quantityAvailable = stockList[0]?.quantity - saleList[0]?.sum_quantity;

    if (quantityAvailable - saleItem.quantity < 0) {
      throw new Error(`Estoque insuficiente para o produto ${saleItem.productPacking.code}, estoque ${stockList[0]?.quantity}, pedidos de venda ${saleList[0]?.sum_quantity}, disponível ${quantityAvailable}, solicitado ${saleItem.quantity}`);
    }
  }

  return zenRes;
}
