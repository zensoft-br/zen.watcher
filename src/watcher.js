import { email } from "./email.js";
import { normalize } from "./normalize.js";
import { print } from "./print.js";

export async function watch(zenReq) {
  let zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.path === "/email") {
    zenRes = await email(zenReq);
  }

  else if (zenReq.path === "/normalize") {
    zenRes = normalize(zenReq);
  }

  else if (zenReq.path === "/print") {
    zenRes = await print(zenReq);
  }

  return zenRes;
}
