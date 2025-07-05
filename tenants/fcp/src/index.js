import { createLambdaHandler } from "../../../shared/src/AwsLambda.js";
import { saleOpPrepare } from "./commercial/sale/saleOpPrepare.js";

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
