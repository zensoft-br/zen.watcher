import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";
import { mailSale } from "./sale/mailSale.js";
import { mailDfeNfeProcOut } from "./fiscal/br/mailDfeNfeProcOut.js";
import { mailReceivable } from "./financial/mailReceivable.js";

export async function mailWatcher(event) {
  const z = Z.createFromToken(event.body.context.tenant, process.env.token);

  if (event.body?.context?.event === "/financial/billing/instructionResponseOpProcess") {
    const id = event.body.args.id;

    const instructionResponse = event.body.result;

    if (result.type === "REGISTERED" && instructionResponse.billingTitle) {
      return await mailReceivable(z, instructionResponse.billingTitle.id);
    }
  }
  else if (event.body?.context?.event === "/fiscal/br/dfeNfeProcOutOpConfirm") {
    const id = event.body.args.id;

    return mailDfeNfeProcOut(z, id);
  }
  else if (event.body?.context?.event === "/sale/saleOpApprove") {
    const id = event.body.args.id;

    return mailSale(z, id);
  }

  throw new HttpError(404, "Not found");
}
