import { normalize } from "./normalize.js";

export async function watch(z_req) {
// See z_req example in z_req.js

  const result = {
    statusCode: 200,
    body: {},
  };

  if (z_req.path === "/normalize") {
    normalize(z_req);
    result.body.args = {
      bean: z_req.body.args.bean,
    };
  }

  return result;
}
