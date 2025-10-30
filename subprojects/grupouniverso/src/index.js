import { createLambdaHandler } from "../../../shared/src/AwsLambda.js";
import { personCreate } from "./catalog/person/personCreate.js";

export const schema = {
  version: "1.0",
  watchers: [
    {
      description: "When a person is created, the default sales price list is automatically assigned to them if no price list has been specified.",
      events: ["/catalog/person/personCreate"],
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

  if (zenReq.body?.context?.event === "/catalog/person/personCreate"
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    const result = await personCreate(zenReq);
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
