import { pickingOrderOpReservationFinish } from "./pickingOrderOpReservationFinish.js";
import { quoteItemProposalCreate } from "./quoteItemProposalCreate.js";
import { quoteOpFill } from "./quoteOpFill.js";
import { saleOpApprove } from "./saleOpApprove.js";

export async function watch(zenReq) {
  let zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.body?.context?.event === "/material/pickingOrderOpReservationFinish" && (zenReq.body?.context?.tags ?? []).includes("after")) {
    zenRes = await pickingOrderOpReservationFinish(zenReq);
  }

  if (zenReq.body?.context?.event === "/sale/quoteItemProposalCreate" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    zenRes = await quoteItemProposalCreate(zenReq);
  }

  if (zenReq.body?.context?.event === "/sale/quoteOpFill" && (zenReq.body?.context?.tags ?? []).includes("after")) {
    zenRes = await quoteOpFill(zenReq);
  }

  if (zenReq.body?.context?.event === "/sale/saleOpApprove" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    zenRes = await saleOpApprove(zenReq);
  }

  return zenRes;
}
