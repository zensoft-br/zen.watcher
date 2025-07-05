import { createLambdaHandler } from "../../../shared/src/AwsLambda.js";

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
