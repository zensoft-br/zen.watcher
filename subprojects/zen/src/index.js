import { createLambdaHandler } from "../../../shared/src/AwsLambda.js";
import { databaseOpOptimize } from "./databaseOpOptimize.js";
import { dfeNfeProcOutOpAuthorize } from "./dfeNfeProcOutOpAuthorize.js";
import { email } from "./email.js";
import { logOpDeleteExpired } from "./logOpDeleteExpired.js";
import { normalize } from "./normalize.js";
import { pickingOrderOpApprove } from "./pickingOrderOpApprove.js";
import { print } from "./print.js";
import { mail } from "./system/integration/mail.js";

export async function watcher(zenReq) {
  let zenRes = {
    statusCode: 200,
    body: {},
  };

  // deprecated
  // if (zenReq.path === "/autoForward") {
  //   zenRes = await autoForward(zenReq);
  // }

  if (zenReq.path === "/hello") {
    const sleep = (ms) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    };
    await sleep(1000);
    return {
      statusCode: 200,
      body: {},
    };
  }

  if (zenReq.path === "/email") {
    zenRes = await email(zenReq);
  }

  else if (zenReq.path === "/fiscal/br/out/authorize" && zenReq.body?.context?.event == "/fiscal/outgoingInvoiceOpApprove") {
    zenRes = await dfeNfeProcOutOpAuthorize(zenReq);
  }

  if (zenReq.path.startsWith("/mail")) {
    return mail(zenReq);
  }

  else if (zenReq.body?.context?.event == "/material/pickingOrderOpApprove") {
    zenRes = await pickingOrderOpApprove(zenReq);
  }

  else if (zenReq.path === "/normalize") {
    zenRes = normalize(zenReq);
  }

  else if (zenReq.path === "/print") {
    zenRes = await print(zenReq);
  }

  // deprecated
  // else if (zenReq.body?.context?.event == "/sale/saleOpApprove") {
  //   zenRes = await saleOpApprove(zenReq);
  // }

  else if (zenReq.path === "/system/audit/logOpDeleteExpired") {
    zenRes = await logOpDeleteExpired(zenReq);
  }

  else if (zenReq.path === "/system/databaseOpOptimize") {
    zenRes = await databaseOpOptimize(zenReq);
  }

  // else if (zenReq.body?.context?.event == "/fiscal/taxation/taxationCreate") {
  //   zenRes = await a(zenReq);
  // }

  return zenRes;
}

export const handler = createLambdaHandler({ watcher });
