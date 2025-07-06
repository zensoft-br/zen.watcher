import { HttpError } from "./HttpError.js";

export const createLambdaHandler = ({ watcher, schema }) => {
  return async (event) => {
    // Normalizar e validar content-type
    const contentType = event.headers?.["content-type"] ?? event.headers?.["Content-Type"] ?? "";
    if (contentType.toLowerCase().trim().startsWith("application/json")) {
      try {
        event.body = JSON.parse(event.body);
      } catch (parseError) {
        return {
          statusCode: 400,
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            type: "error",
            message: "Invalid JSON body",
            details: parseError.message,
          }),
        };
      }
    }

    const zenReq = {
      method: event.requestContext?.http?.method ?? "POST",
      path: event.requestContext?.http?.path ?? "/",
      query: event.queryStringParameters ?? {},
      headers: event.headers ?? {},
      body: event.body ?? {},
    };

    try {
      if (zenReq.path === "/schema") {
        // If the path is /schema, return the schema of the watcher
        return {
          statusCode: 200,
          headers: { "content-type": "application/json" },
          body: JSON.stringify(schema ?? {
            message: "No schema defined for this watcher.",
          }),
        };
      }

      let result = await watcher(zenReq);

      // Garante statusCode e body stringificado
      result = {
        ...result,
        statusCode: result?.statusCode ?? 200,
      };

      if (typeof result.body !== "string") {
        result.body = JSON.stringify(result.body ?? null);
      }

      return result;
    } catch (error) {
      console.error("Lambda handler error:", error);

      if (error instanceof HttpError) {
        return {
          statusCode: error.statusCode,
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            type: "error",
            message: error.message,
            ...(Object.keys(error.payload ?? {}).length > 0 && { payload: error.payload }),
          }),
        };
      }

      return {
        statusCode: 500,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          type: "error",
          message: error?.message ?? "Unknown error",
          stackTrace: process.env.NODE_ENV === "production" ? {} : error?.stack ?? "",
        }),
      };
    }
  };
};
