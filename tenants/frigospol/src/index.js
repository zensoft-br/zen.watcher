import { createLambdaHandler } from "../../../shared/src/AwsLambda.js";
import { outgoingInvoiceOpApprove } from "./fiscal/outgoingInvoiceOpApprove.js";
import { outgoingInvoiceOpPrepare } from "./fiscal/outgoingInvoiceOpPrepare.js";
import { incomingListItemCreate } from "./material/incomingListItemCreate.js";
import { saleOpApprove } from "./sale/saleOpApprove.js";

export async function watcher(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.body?.context?.event === "/fiscal/outgoingInvoiceOpPrepare" && zenReq.body?.context?.tags?.includes("before")) {
    return await outgoingInvoiceOpPrepare(zenReq);
  }

  if (zenReq.body?.context?.event === "/fiscal/outgoingInvoiceOpApprove" && zenReq.body?.context?.tags?.includes("after")) {
    return await outgoingInvoiceOpApprove(zenReq);
  }

  if (zenReq.body?.context?.event === "/material/incomingListItemCreate" && zenReq.body?.context?.tags?.includes("before")) {
    return await incomingListItemCreate(zenReq);
  }

  if (zenReq.body?.context?.event === "/material/incomingListItemCreate" && zenReq.body?.context?.tags?.includes("after")) {
    return await incomingListItemCreate(zenReq);
  }

  // if (zenReq.body?.context?.event === "/material/lotCreate" && zenReq.body?.context?.tags?.includes("before")) {
  //   return await lotCreate_setCodeSequence(zenReq);
  // }

  if (zenReq.body?.context?.event === "/sale/saleOpApprove" && zenReq.body?.context?.tags?.includes("after")) {
    return await saleOpApprove(zenReq);
  }

  return zenRes;
}

export const handler = createLambdaHandler(watcher);
