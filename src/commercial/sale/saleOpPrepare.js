import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

/*
 * Calcula a comissão do pedido de venda com base na margem de contribuição
 */
export async function saleOpPrepare(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const saleId = zenReq.body.args.id;

  const purchaseService = new Z.api.supply.purchase.PurchaseService(z);
  const saleService = new Z.api.sale.SaleService(z);

  const sale = await saleService.saleReadById(saleId);
  const saleItemList = await saleService.saleItemRead(`q=sale.id==${saleId}`);

  const productPackingIdList = saleItemList
    .map(e => e.productPacking.id)
    // distinct
    .filter((e, i, arr) => arr.indexOf(e) == i);

  // Load cost values from price list
  const priceListItemList = await purchaseService.priceListItemRead(`q=priceList.id==1003;(${productPackingIdList.map(e => `productPacking.id==${e}`).join(",")})`);

  // Make sure a cost was found for each productPacking
  const productPackingNotFound = saleItemList.filter(e => !priceListItemList.find(e1 => e1.productPacking.id == e.productPacking.id)).map(e => e.productPacking.code);
  if (productPackingNotFound.length)
    throw new Error(`Valor unitário de custo não encontrado para os produtos ${productPackingNotFound.join(",")}`);

  const { costValue, productValue, contributionMargin, markup  } = saleItemList.reduce((red, e) => {
    red.productValue = round(red.productValue + e.productValue, 2);
    red.costValue = round(red.costValue + (e.quantity * e.costUnitValue), 2);
    red.contributionMargin = (red.productValue - red.costValue) / red.productValue * 100;
    red.markup = (red.productValue / red.costValue) * 100 - 100;
    return red;
  }, { productValue: 0, costValue: 0 });

  let salesCommission = 0;
  if (markup >= 30 && markup <= 35)
    salesCommission = 1;
  else if (markup > 35 && markup <= 40)
    salesCommission = 2;
  else if (markup > 40 && markup <= 45)
    salesCommission = 3;
  else if (markup > 45 && markup <= 55)
    salesCommission = 4;
  else if (markup > 55 && markup <= 65)
    salesCommission = 5;
  else if (markup > 65 && markup <= 75)
    salesCommission = 6;
  else if (markup > 75 && markup <= 85)
    salesCommission = 7;
  else if (markup > 85 && markup <= 95)
    salesCommission = 8;
  else if (markup > 95 && markup <= 105)
    salesCommission = 9;
  else if (markup > 105)
    salesCommission = 10;

  sale.properties = {
    ...sale.properties,
    costValue,
    productValue,
    contributionMargin,
    markup,
    salesCommission,
  };

  await saleService.saleUpdate(sale);
}

function round(value, digits) {
  return Math.round(value * (10 ** digits)) / 10 ** digits;
}