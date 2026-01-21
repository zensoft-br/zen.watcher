import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function saleOpPrepare(zenReq) {
  if (zenReq.body?.context?.event !== "/sale/saleOpPrepare") {
    return;
  }

  if (!(zenReq.body?.context?.tags ?? []).includes("before")) {
    return;
  }

  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const saleService = new Z.api.sale.SaleService(z);
  const sale = await saleService.saleReadById(zenReq.body.args.id);

  if (sale.priceList.id === 1022) {
    return;
  }

  const saleItemList = await saleService.saleItemRead(`q=sale.id==${sale.id}`);

  let oldComission = -1;
  let newComission = 0;
  let saleComissionUpdate = true;
  let coeficient = 1;

  for (const saleItem of saleItemList) {
    coeficient = saleItem.productPacking.product.tags?.split(",")?.includes("comissao:2") ? 2 : 1;
    newComission = await getComission(saleItem.unitValue, saleItem.priceListValue, coeficient);

    if (oldComission == -1) {
      oldComission = newComission;
    }

    if (oldComission != newComission) {
      saleComissionUpdate = false;
    }

    if (newComission === 0) {
      delete saleItem.properties.salesCommission;
    } else {
      saleItem.properties["salesCommission"] = newComission;
    }

    await saleService.saleItemUpdate(saleItem);
  }

  if (saleComissionUpdate) {
    sale.properties.salesCommission = newComission;
  } else {
    delete sale.properties.salesCommission;
  }

  await saleService.saleUpdate(sale);
}

async function getComission(unitValue, priceListValue, coeficient) {
  const discountValue = priceListValue - unitValue;
  if (discountValue <= 0) {
    return 5;
  } else if (discountValue <= coeficient) {
    return 4;
  } else if (discountValue <= (coeficient * 2)) {
    return 3;
  } else if (discountValue <= (coeficient * 3)) {
    return 2;
  } else  
    return 0;  
}
