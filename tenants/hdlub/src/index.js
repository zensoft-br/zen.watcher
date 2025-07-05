import { createLambdaHandler } from "../../../shared/src/AwsLambda.js";
import { corpen } from "./system/integration/corpen/corpen.js";

export async function watcher(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

  await corpen(zenReq);

  return zenRes;
}

export const handler = createLambdaHandler(watcher);
