import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function mailWatcher(event) {
  if (event.body?.context?.event === "/financial/billing/instructionResponseOpProcess") {
    const id = event.body.args.id;
  }
  else if (event.body?.context?.event === "/fiscal/br/dfeNfeProcOutOpConfirm") {
    const id = event.body.args.id;
  }
  else if (event.body?.context?.event === "/sale/saleOpApprove") {
    const id = event.body.args.id;
  }
}
