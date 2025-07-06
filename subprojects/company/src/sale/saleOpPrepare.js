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
  const salePaymentList = await saleService.salePaymentRead(`q=sale.id==${id}`);
  let antecipado = false;
  let saleUpdate = false;

  // Pedido antecipado
  if (salePaymentList.length == 1 && salePaymentList[0].term == 0) {
    // Adiciona a tag antecipado
    sale.tags = (sale.tags ?? "").split(",").filter((e) => e).concat("antecipado").join(",");
    antecipado = true;
    saleUpdate = true;
  }

  const saleItemList = await saleService.saleItemRead(`q=sale.id==${id}`);

  let oldComission = -1;
  let newComission = 0;
  let saleComissionUpdate = true;

  for (const saleItem of saleItemList) {
    const priceListValue = (antecipado ? Math.round(saleItem.priceListValue * 0.96 * 100) / 100 : saleItem.priceListValue);
    if (saleItem.sale.priceList.code === "ATACADO")
      newComission = await getComission("ATA", saleItem.unitValue, priceListValue);
    else if (saleItem.sale.priceList.code === "CONFECCAO")
      newComission = await getComission("CON", saleItem.unitValue, priceListValue);
    else
      return;

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
    if ((sale.priceList.code === "ATACADO") || (sale.priceList.code === "CONFECCAO")) {
      delete sale.properties.salesCommission;
      saleUpdate = true;
    }
  }

  if (saleUpdate)
    await saleService.saleUpdate(sale);
}

async function getComission(type, unitValue, priceListValue) {
  const discountValue = Math.round((priceListValue - unitValue) / priceListValue * 10000) / 100;
  if (type === "ATA") {
    if (discountValue > 10)
      return 0;
    else if (discountValue > 9)
      return 1;
    else if (discountValue > 8)
      return 1.1;
    else if (discountValue > 7)
      return 1.2;
    else if (discountValue > 6)
      return 1.3;
    else if (discountValue > 5)
      return 1.4;
    else if (discountValue > 4)
      return 1.5;
    else if (discountValue > 3)
      return 1.8;
    else if (discountValue > 2)
      return 2.1;
    else if (discountValue > 1)
      return 2.4;
    else if (discountValue > 0)
      return 2.7;
    else
      return 3;
  } else if (type === "CON") {
    if (discountValue > 15)
      return 0;
    else if (discountValue > 13.5)
      return 1;
    else if (discountValue > 12)
      return 1.5;
    else if (discountValue > 10.5)
      return 2;
    else if (discountValue > 9)
      return 2.5;
    else if (discountValue > 7.5)
      return 3;
    else if (discountValue > 6)
      return 3.5;
    else if (discountValue > 4.5)
      return 4;
    else if (discountValue > 3)
      return 4.5;
    else if (discountValue > 1.5)
      return 5;
    else if (discountValue > 0)
      return 5.5;
    else
      return 6;
  }
}
