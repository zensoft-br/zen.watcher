import { pickingOrderOpReservationFinish } from "./pickingOrderOpReservationFinish.js";
import { saleOpApprove } from "./saleOpApprove.js";

// eslint-disable-next-line no-unused-vars
export async function watch(zenReq) {
  let zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.body?.context?.event === "/material/pickingOrderOpReservationFinish" && (zenReq.body?.context?.tags ?? []).includes("after")) {
    zenRes = await pickingOrderOpReservationFinish(zenReq);
  }

  if (zenReq.body?.context?.event === "/sale/saleOpApprove" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    zenRes = await saleOpApprove(zenReq);
  }

  return zenRes;
}
