import { createLambdaHandler } from "../../../shared/src/lambdaHandler.js";

export const watcher = async (zenReq) => {
  return {
    statusCode: 200,
    contentType: "application/json",
    body: {
      message: "Hello from the echo tenant!",
      zenReq,
    },
  };
};

export const handler = createLambdaHandler(watcher);
