import { email } from "./email.js";
import { normalize } from "./normalize.js";
import { print } from "./print.js";

export async function watch(zenReq) {
  let result = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.path === "/email") {
    result = await email(zenReq);
  }

  else if (zenReq.path === "/normalize") {
    normalize(zenReq);
    result.body.args = zenReq.body.args;
  }

  else if (zenReq.path === "/print") {
    result = await print(zenReq);
  }

  return result;
}
