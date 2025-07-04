import { saleOpPrepare } from "./commercial/sale/saleOpPrepare.js";

// eslint-disable-next-line no-unused-vars
export async function watcher(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.body?.context?.event === "/sale/saleOpPrepare" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    await saleOpPrepare(zenReq);
  }

  return zenRes;
}

export const handler = createLambdaHandler(watcher);
