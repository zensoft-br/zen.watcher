import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function saleOpPrepare(zenReq) {
  if (zenReq.body?.context?.event !== "/sale/saleOpPrepare")
    return;

  if (!(zenReq.body?.context?.tags ?? []).includes("before"))
    return;

  const id = zenReq.body.args.id;

  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const saleService = new Z.api.sale.SaleService(z);

  const sale = await saleService.saleReadById(id);

  if (sale.priceList.code === '1004')
    return;

  const saleItemList = await saleService.saleItemRead(`q=sale.id==${id}`);

  let saleUpdate = false;
  let oldComission = -1;
  let newComission = 0;
  let saleComissionUpdate = true;
  
  for (const saleItem of saleItemList) {
    const priceListValue = saleItem.priceListValue;
    newComission = await getComission(saleItem.unitValue, priceListValue);

    if (oldComission == -1)
      oldComission = newComission;

    if (oldComission != newComission)
      saleComissionUpdate = false;    

    saleItem.properties["salesCommission"] = newComission;    
    await saleService.saleItemUpdate(saleItem);
  }

  if (saleComissionUpdate) {
    sale.properties.salesCommission = newComission;
    saleUpdate = true;
  }
  else {
    delete sale.properties.salesCommission;
    saleUpdate = true;    
  }

  if (saleUpdate)
    await saleService.saleUpdate(sale);
}

async function getComission(unitValue, priceListValue) {
  if (unitValue >= priceListValue)
    return 10;
  else {
    let newPriceListValue = priceListValue;
    let i = 9;
    while (i >= 3) {
      newPriceListValue = Math.round(newPriceListValue / 1.03 * 100) / 100;
      if (unitValue >= newPriceListValue) return i;
      i--;
    }
    return 0;
  }  
}
