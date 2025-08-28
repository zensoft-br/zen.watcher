import { HttpError } from "./HttpError.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
  "Access-Control-Allow-Credentials": "true", // optional
};

function buildResponse(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: { ...corsHeaders, ...extraHeaders, "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body ?? null),
  };
}

export const createLambdaHandler = ({ watcher, schema }) => {
  return async (event) => {
    try {
      const method = event.requestContext?.http?.method ?? "POST";

      // Handle CORS preflight
      if (method === "OPTIONS") {
        return buildResponse(200, { ok: true });
      }

      // Parse JSON if applicable
      const contentType = event.headers?.["content-type"] ?? event.headers?.["Content-Type"] ?? "";
      if (contentType.toLowerCase().trim().startsWith("application/json") && event.body) {
        try {
          event.body = JSON.parse(event.body);
        } catch (parseError) {
          return buildResponse(400, {
            type: "error",
            message: "Invalid JSON body",
            details: parseError.message,
          });
        }
      }

      const zenReq = {
        method,
        path: event.requestContext?.http?.path ?? "/",
        query: event.queryStringParameters ?? {},
        headers: event.headers ?? {},
        body: event.body ?? {},
      };

      if (zenReq.path === "/schema") {
        return buildResponse(200, schema ?? { message: "No schema defined for this watcher." });
      }

      let result = await watcher(zenReq);

      return buildResponse(
        result?.statusCode ?? 200,
        result?.body,
        result?.headers
      );
    } catch (error) {
      console.error("Lambda handler error:", error);

      if (error instanceof HttpError) {
        return buildResponse(error.statusCode, {
          type: "error",
          message: error.message,
          ...(Object.keys(error.payload ?? {}).length > 0 && { payload: error.payload }),
        });
      }

      return buildResponse(500, {
        type: "error",
        message: error?.message ?? "Unknown error",
        stackTrace: process.env.NODE_ENV === "production" ? {} : error?.stack ?? "",
      });
    }
  };
};
