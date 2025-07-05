import * as Z from "@zensoftbr/zenerpclient";
import "dotenv/config";
import { HttpError } from "../../../../../shared/src/HttpError.js";
import { mailReceivable } from "./financial/mailReceivable.js";
import { mailDfeNfeProcOut } from "./fiscal/br/mailDfeNfeProcOut.js";
import { mailSale } from "./sale/mailSale.js";

export async function mailDirect(event) {
  const source = event.queryStringParameters?.source ?? "";
  const id = source.split(":")[1];

  const z = Z.createFromToken(event.body.context.tenant, process.env.token);

  if (source.startsWith("/financial/receivable:")) {
    return mailReceivable(z, id);
  }

  if (source.startsWith("/fiscal/br/dfeNfeProcOut:")) {
    return mailDfeNfeProcOut(z, id);
  }

  if (source.startsWith("/fiscal/outgoingInvoice:")) {
    // return mailOutgoingInvoice(z, id);
    throw new HttpError(404, "Not found");
  }

  if (source.startsWith("/sale/sale:")) {
    return mailSale(z, id);
  }

  if (source.startsWith("/supply/purchase/purchase:")) {
    // return mailPurchase(z, id);
    throw new HttpError(404, "Not found");
  }

  throw new HttpError(404, "Not found");
}
