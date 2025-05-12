import { pickingOrderOpReservationFinish } from "./pickingOrderOpReservationFinish.js";
import { quoteItemProposalCreate } from "./quoteItemProposalCreate.js";
import { quoteOpFill } from "./quoteOpFill.js";
import { saleOpApprove_after } from "./saleOpApprove_after.js";
import { saleOpApprove_before } from "./saleOpApprove_before.js";

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

  if (zenReq.body?.context?.event === "/sale/saleOpApprove" && (zenReq.body?.context?.tags ?? []).includes("after")) {
    zenRes = await saleOpApprove_after(zenReq);
  }

  if (zenReq.body?.context?.event === "/sale/saleOpApproveUnconditionally" && (zenReq.body?.context?.tags ?? []).includes("after")) {
    zenRes = await saleOpApprove_after(zenReq);
  }

  if (zenReq.body?.context?.event === "/sale/saleOpApprove" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    zenRes = await saleOpApprove_before(zenReq);
  }

  return zenRes;
}
