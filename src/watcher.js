import { lotCreate_setCodeSequence } from "./material/lot.js";

// eslint-disable-next-line no-unused-vars
export async function watch(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.body?.context?.event === "/material/lotCreate" && zenReq.body?.context?.tags?.includes("before")) {
    return await lotCreate_setCodeSequence(zenReq);
  }

  return zenRes;
}
