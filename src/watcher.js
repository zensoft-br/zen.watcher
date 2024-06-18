import { incomingList_createLot } from "./material/incomingList.js";
import { lotCreate_setCodeSequence } from "./material/lot.js";
import { saleOpApprove_cloneToFS } from "./saleOpApprove.js";

// eslint-disable-next-line no-unused-vars
export async function watch(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.body?.context?.event === "/material/incomingListCreate" && zenReq.body?.context?.tags?.includes("before")) {
    return await incomingList_createLot(zenReq);
  }

  if (zenReq.body?.context?.event === "/material/lotCreate" && zenReq.body?.context?.tags?.includes("before")) {
    return await lotCreate_setCodeSequence(zenReq);
  }

  if (zenReq.body?.context?.event === "/sale/saleOpApprove" && zenReq.body?.context?.tags?.includes("after")) {
    return await saleOpApprove_cloneToFS(zenReq);
  }

  return zenRes;
}
