import { createLambdaHandler } from "../../../shared/src/lambdaHandler.js";

export const watcher = async (zenReq) => {
  // Sua lógica do interceptador aqui, por exemplo:
  if (zenReq.path === "/hello") {
    return { statusCode: 200, body: "Hello!", contentType: "text/plain" };
  }
  // return { statusCode: 404, body: "Not found" };
};

export const handler = createLambdaHandler(watcher);
