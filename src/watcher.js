import { incomingListItemCreate } from "./incomingListItemCreate.js";
import { saleOpApprove_cloneToFS } from "./saleOpApprove.js";

export async function watch(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

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
    return await saleOpApprove_cloneToFS(zenReq);
  }

  return zenRes;
}
