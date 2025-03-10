// DEPRECATED?

import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function a(zenReq) {
  const bean = zenReq.body.args.bean;

  const source = bean.source ?? "";

  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  let item = undefined;
  let master = undefined;
  if (source.startsWith("/fiscal/incomingInvoiceItem:")) {
    const fiscalService = new Z.api.fiscal.FiscalService(z);

    item = await fiscalService.incomingInvoiceItemReadById(Number(source.split(":")[1]));
    master = item.incomingInvoice;
  }
  else if (source.startsWith("/supply/purchase/purchaseItem:")) {
    const purchaseService = new Z.api.supply.purchase.PurchaseService(z);

    item = await purchaseService.purchaseItemReadById(source.split(":")[1]);
    master = item.purchase;
  }

  if (item) {
    if (bean.tax.code === "COFINS" || bean.tax.code === "PIS") {
      bean.compensationRate = 100;
    }

    return zenReq;
  }
}