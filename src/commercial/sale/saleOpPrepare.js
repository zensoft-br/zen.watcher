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

  const productValue = saleItemList.reduce((red, e) => red + e.productValue, 0);
  const costValue = saleItemList.reduce((red, e) => red + priceListItemList.filter(e1 => e1.productPacking.id == e.productPacking.id)[0].unitValue * e.quantity, 0);
  const contributionMargin = round(productValue - costValue, 2);
  const contributionMarginPercent = round(contributionMargin / costValue * 100, 2);

  let salesCommission = 0;
  if (contributionMarginPercent >= 30 && contributionMarginPercent <= 35)
    salesCommission = 1;
  else if (contributionMarginPercent > 35 && contributionMarginPercent <= 40)
    salesCommission = 2;
  else if (contributionMarginPercent > 40 && contributionMarginPercent <= 45)
    salesCommission = 3;
  else if (contributionMarginPercent > 45 && contributionMarginPercent <= 55)
    salesCommission = 4;
  else if (contributionMarginPercent > 55 && contributionMarginPercent <= 65)
    salesCommission = 5;
  else if (contributionMarginPercent > 65 && contributionMarginPercent <= 75)
    salesCommission = 6;
  else if (contributionMarginPercent > 75 && contributionMarginPercent <= 85)
    salesCommission = 7;
  else if (contributionMarginPercent > 85 && contributionMarginPercent <= 95)
    salesCommission = 8;
  else if (contributionMarginPercent > 95 && contributionMarginPercent <= 105)
    salesCommission = 9;
  else if (contributionMarginPercent > 105)
    salesCommission = 10;

  sale.properties = {
    ...sale.properties,
    productValue,
    costValue,
    contributionMargin,
    contributionMarginPercent,
    salesCommission,
  };

  await saleService.saleUpdate(sale);
}

function round(value, digits) {
  return Math.round(value * (10 ** digits)) / 10 ** digits;
}