import { personCreate } from "./personCreate.js";
import { instructionRequestOpCreateRegister } from "./instructionRequestOpCreateRegister.js";
import { receivableOpApprove } from "./receivableOpApprove.js";
import { saleOpApprove } from "./saleOpApprove.js";
import { purchaseCreate } from "./purchaseCreate.js";

export async function watch(zenReq) {
  let zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.body?.context?.event === "/catalog/person/personCreate" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    zenRes = await personCreate(zenReq);
  }

  if (zenReq.body?.context?.event === "/financial/receivableOpApprove" && (zenReq.body?.context?.tags ?? []).includes("after")) {
    zenRes = await receivableOpApprove(zenReq);
  }

  if (zenReq.body?.context?.event === "/financial/receivableOpApprove" && (zenReq.body?.context?.tags ?? []).includes("after")) {
    zenRes = await instructionRequestOpCreateRegister(zenReq);
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
