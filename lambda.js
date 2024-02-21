// DO NOT CHANGE THIS FILE!

import { watch } from "./src/watcher.js";

export const handler = async (event) => {
  if ((event.headers?.["content-type"] ?? "").toLowerCase().startsWith("application/json"))
    event.body = JSON.parse(event.body);

  // Convert AWS Lambda event to zenReq
  const zenReq = {
    method: event.requestContext?.http?.method ?? "POST",
    path: event.requestContext?.http?.path ?? "/",
    query: event.queryStringParameters ?? {},
    headers: event.headers ?? {},
    body: event.body ?? {},
  };

  let result = await watch(zenReq);
  result = {
    ...result,
    statusCode: result?.statusCode ?? 200,
  };

  return result;
};