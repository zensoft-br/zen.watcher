import { saleOpPrepare } from "./sale/saleOpPrepare.js";

// eslint-disable-next-line no-unused-vars
export async function watcher(zenReq) {
  let zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.body?.context?.event === "/sale/saleOpPrepare"
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    const result = await saleOpPrepare(zenReq);
    if (result) {
      zenRes = {
        ...zenRes,
        ...result,
      };
    }
  }

  return zenRes;
}

export const handler = createLambdaHandler(watcher);
