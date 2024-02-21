import { normalize } from "./normalize.js";

export async function watch(zenReq) {
  const result = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.path === "/normalize") {
    normalize(zenReq);
    result.body.args = zenReq.body.args;
  }

  return result;
}
