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

  try {
    let result = await watch(zenReq);
    result = {
      ...result,
      statusCode: result?.statusCode ?? 200,
    };

    // Adiciona um body null
    result.body = result.body ?? "null";

    return result;
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: {
        type: "error",
        message: error.message,
        stackTrace: process.env.NODE_ENV === "producttion" ? {} : error.stack,
      },
    };
  }
};