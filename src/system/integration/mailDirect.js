import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";
import { mailDfeNfeProcOut } from "./fiscal/br/mailDfeNfeProcOut.js";

export async function mailDirect(event) {
  const source = event.queryStringParameters?.source ?? "";
  const id = source.split(":")[1];

  if (source.startsWith("/financial/receivable:")) {

  }

  if (source.startsWith("/fiscal/br/dfeNfeProcOut:")) {
    return mailDfeNfeProcOut();
  }

  if (source.startsWith("/fiscal/outgoingInvoice:")) {

  }

  if (source.startsWith("/sale/sale:")) {

  }

  return { statusCode: 400 };
}
