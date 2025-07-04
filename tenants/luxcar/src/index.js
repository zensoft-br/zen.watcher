import { incomingListCreate } from "./incomingListCreate.js";
import { incomingListOpPrepare } from "./incomingListOpPrepare.js";
import { instructionRequestOpCreateRegister } from "./instructionRequestOpCreateRegister.js";
import { personCreate } from "./personCreate.js";
import { purchaseCreate } from "./purchaseCreate.js";
import { outgoingInvoiceOpApprove } from "./outgoingInvoiceOpApprove.js";
import { saleOpApprove } from "./saleOpApprove.js";

export async function watcher(zenReq) {
  let zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.body?.context?.event === "/catalog/person/personCreate" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    zenRes = await personCreate(zenReq);
  }

  if (zenReq.body?.context?.event === "/financial/receivableOpApprove" && (zenReq.body?.context?.tags ?? []).includes("after")) {
    zenRes = await instructionRequestOpCreateRegister(zenReq);
  }

  if (zenReq.body?.context?.event === "/fiscal/outgoingInvoiceOpApprove" && (zenReq.body?.context?.tags ?? []).includes("after")) {
    zenRes = await outgoingInvoiceOpApprove(zenReq);
  }

  if (zenReq.body?.context?.event === "/material/incomingListCreate" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    zenRes = await incomingListCreate(zenReq);
  }

  if (zenReq.body?.context?.event === "/material/incomingListOpPrepare") {
    zenRes = await incomingListOpPrepare(zenReq);
  }

  if (zenReq.body?.context?.event === "/sale/saleOpApprove" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    zenRes = await saleOpApprove(zenReq);
  }

  if (["/supply/purchase/purchaseCreate", "/supply/purchase/purchaseUpdate"].includes(zenReq.body?.context?.event)
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    zenRes = await purchaseCreate(zenReq);
  }

  return zenRes;
}

export const handler = createLambdaHandler(watcher);
