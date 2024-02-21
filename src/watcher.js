import { normalize } from "./normalize.js";

export async function watch(z_req) {
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
}
