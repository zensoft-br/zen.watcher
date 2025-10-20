import { createLambdaHandler } from "../../../shared/src/AwsLambda.js";
import { productPackingCreate } from "./catalog/product/productPackingCreate.js";

export const schema = {
  version: "1.0",
  watchers: [
    {
      description: "Watch for sale creation to prepare the sale operation",
      events: ["/catalog/product/productPackingCreate"],
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

  if (zenReq.body?.context?.event === "/catalog/product/productPackingCreate"
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    const result = await productPackingCreate(zenReq);
    if (result) {
      zenRes = {
        ...zenRes,
        ...result,
      };
    }
  }
  return zenRes;
}

export const handler = createLambdaHandler({ watcher, schema });
