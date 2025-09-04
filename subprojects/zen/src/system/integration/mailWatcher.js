import * as Z from "@zensoftbr/zenerpclient";
import "dotenv/config";
import { HttpError } from "../../../../../shared/src/HttpError.js";
import { mailReceivable } from "./financial/mailReceivable.js";
import { mailDfeNfeProcOut } from "./fiscal/br/mailDfeNfeProcOut.js";
import { mailSale } from "./sale/mailSale.js";

export async function mailWatcher(event) {
  const z = Z.createFromToken(event.body.context.tenant, process.env.token);

  if (event.body?.context?.event === "/financial/billing/instructionResponseOpProcess") {
    // const id = event.body.args.id;

    const instructionResponse = event.body.result;

    if (instructionResponse.type === "REGISTERED" && instructionResponse.billingTitle) {
      return await mailReceivable(z, instructionResponse.billingTitle.id);
    }
  } else if (["/fiscal/br/dfeNfeProcOutOpTransmit","/fiscal/br/dfeNfeProcOutOpConfirm"]
    .includes(event.body?.context?.event)) {
    const id = event.body.args.id;

    return mailDfeNfeProcOut(z, id);
  } else if (event.body?.context?.event === "/sale/saleOpApprove") {
    const id = event.body.args.id;

    return mailSale(z, id);
  }

  throw new HttpError(404, "Not found");
}
