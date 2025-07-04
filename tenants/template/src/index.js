import { createLambdaHandler } from "../../../shared/src/lambdaHandler.js";

export const watcher = async (zenReq) => {
  // Your business logic goes here
  if (zenReq.path === "/hello") {
    return { statusCode: 200, body: "Hello!" };
  }
  return { statusCode: 404, body: "Not found" };
};

export const handler = createLambdaHandler(watcher);
