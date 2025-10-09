import { createLambdaHandler } from "../../../shared/src/AwsLambda.js";
import { corpen } from "./system/integration/corpen/corpen.js";
import { saleOpPrepare } from "./sale/saleOpPrepare.js";

export const schema = {
  version: "1.0",
  watchers: [
    {
      description: "Prepare sale operation before processing sale operations",
      events: ["/sale/saleOpPrepare"],
      path: "/",
      tags: ["before"],
    },
  ],
};

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

  await corpen(zenReq);

  return zenRes;
}

export const handler = createLambdaHandler({ watcher, schema });
