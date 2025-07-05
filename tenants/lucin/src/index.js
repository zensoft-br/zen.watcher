import { personRead } from "./catalog/person/personRead.js";
import { productCreateUpdate } from "./catalog/product/productCreateUpdate.js";
import { productPackingCreate } from "./catalog/product/productPackingCreate.js";
import { payableRead } from "./financial/payableRead.js";
import { receivableRead } from "./financial/receivableRead.js";
import { incomingInvoiceRead } from "./fiscal/incomingInvoiceRead.js";
import { outgoingInvoiceRead } from "./fiscal/outgoingInvoiceRead.js";
import { saleOpApprove } from "./sale/saleOpApprove.js";
import { saleOpCreate } from "./sale/saleOpCreate.js";
import { purchaseRead } from "./supply/purchase/purchaseRead.js";
import { createLambdaHandler } from "../../../shared/src/AwsLambda.js";

export async function watcher(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.body.context.event === "/catalog/person/personRead" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await personRead(zenReq);
  }

  if (zenReq.body.context.event === "/catalog/product/productCreate"
    || zenReq.body.context.event === "/catalog/product/productUpdate") {
    if ((zenReq.body?.context?.tags ?? []).includes("before")) {
      return await productCreateUpdate(zenReq);
    }
  }

  if (zenReq.body.context.event === "/catalog/product/productPackingCreate") {
    return await productPackingCreate(zenReq);
  }

  if (zenReq.body.context.event === "/financial/payableRead" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await payableRead(zenReq);
  }

  if (zenReq.body.context.event === "/financial/receivableRead" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await receivableRead(zenReq);
  }

  if (zenReq.body.context.event === "/fiscal/incomingInvoiceRead" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await incomingInvoiceRead(zenReq);
  }

  if (zenReq.body.context.event === "/fiscal/outgoingInvoiceRead" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await outgoingInvoiceRead(zenReq);
  }

  if (zenReq.body.context.event === "/sale/saleOpApprove" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await saleOpApprove(zenReq);
  }

  if (zenReq.body.context.event === "/sale/saleOpCreate") {
    return await saleOpCreate(zenReq);
  }

  if (zenReq.body.context.event === "/supply/purchase/purchaseRead" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await purchaseRead(zenReq);
  }

  return zenRes;
}

export const handler = createLambdaHandler(watcher);
