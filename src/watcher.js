import { email } from "./email.js";
import { logOpDeleteExpired } from "./logOpDeleteExpired.js";
import { normalize } from "./normalize.js";
import { print } from "./print.js";
import { saleProcess } from "./sale/saleProcess.js";

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

  else if (zenReq.path === "/sale/process") {
    zenRes = await saleProcess(zenReq);
  }

  else if (zenReq.path === "/system/audit/logOpDeleteExpired") {
    zenRes = await logOpDeleteExpired(zenReq);
  }

  return zenRes;
}
