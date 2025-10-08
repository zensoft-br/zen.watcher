import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function saleOpPrepare(zenReq) {
  const id = zenReq.body.args.id;

  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const saleService = new Z.api.sale.SaleService(z);
  const sale = await saleService.saleReadById(id);  

  // Pedido abaixo do valor mínimo de R$ 1800,00
  let saleUpdate = false;
  if (sale.totalValue < 1800) {
    // Adiciona a tag valor mínimo
    sale.tags = (sale.tags ?? "").split(",").filter((e) => e).concat("valorminimo").join(",");
    saleUpdate = true;
  }

  // calcula a comissão dos itens do pedido
  const saleItemList = await saleService.saleItemRead(`q=sale.id==${id}`);

  let oldComission = -1;
  let newComission = 0;
  let saleComissionUpdate = true;

  for (const saleItem of saleItemList) {
    const priceListValue = saleItem.priceListValue;
    if ((saleItem.sale.priceList?.tags ?? []).includes("internaES")) {
      newComission = await getComission("internaES", saleItem.unitValue, priceListValue);
    } else if ((saleItem.sale.priceList?.tags ?? []).includes("externaES")) {
      newComission = await getComission("externaES", saleItem.unitValue, priceListValue);
    } else {
      saleComissionUpdate = false;
      continue;
    }

    if (oldComission == -1) {
      oldComission = newComission;
    }

    if (oldComission != newComission) {
      saleComissionUpdate = false;
    }

    saleItem.properties["salesCommission"] = newComission;

    await saleService.saleItemUpdate(saleItem);
  }

  if (saleComissionUpdate) {
    sale.properties.salesCommission = newComission;
    saleUpdate = true;
  } else {
    if (((sale.priceList?.tags ?? []).includes("internaES")) || ((sale.priceList?.tags ?? []).includes("externaES"))) {
      delete sale.properties.salesCommission;
      saleUpdate = true;
    }
  }

  if (saleUpdate) {
    await saleService.saleUpdate(sale);
  }
}

async function getComission(type, unitValue, priceListValue) {
  const discountValue = Math.round((priceListValue - unitValue) / priceListValue * 1000) / 10;
  if (type === "externaES") {
    if (discountValue > 15) {
      return 0;
    } else if (discountValue > 13.75) {
      return 1;
    } else if (discountValue > 12.5) {
      return 2;
    } else if (discountValue > 11.25) {
      return 3;
    } else if (discountValue > 10) {
      return 4;
    } else if (discountValue > 8.75) {
      return 5;
    } else if (discountValue > 7.5) {
      return 6;
    } else if (discountValue > 6.25) {
      return 7;
    } else if (discountValue > 5) {
      return 8;
    } else if (discountValue > 3.75) {
      return 9;
    } else if (discountValue > 2.5) {
      return 10;
    } else if (discountValue > 1.25) {
      return 11;
    } else if (discountValue > 0) {
      return 12;
    } else if (discountValue > -1.25) {
      return 13;
    } else if (discountValue > -2.5) {
      return 14;
    } else if (discountValue > -3.75) {
      return 15;
    } else if (discountValue > -5) {
      return 16;
    } else if (discountValue > -6.25) {
      return 17;
    } else if (discountValue > -7.5) {
      return 18;
    } else if (discountValue > -8.75) {
      return 19;
    } else {
      return 20;
    }
  } else if (type === "internaES") {
    if (discountValue > 0) {
      return 0;
    } else if (discountValue > -1.25) {
      return 0.5;
    } else if (discountValue > -2.5) {
      return 1;
    } else if (discountValue > -3.75) {
      return 1.5;
    } else if (discountValue > -5) {
      return 2;
    } else if (discountValue > -6.25) {
      return 2.5;
    } else if (discountValue > -7.5) {
      return 3;
    } else if (discountValue > -8.75) {
      return 3.5;
    } else if (discountValue > -10) {
      return 4;
    } else if (discountValue > -11.25) {
      return 4.5;
    } else {
      return 5;
    }
  }
}
