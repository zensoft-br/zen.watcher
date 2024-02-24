import { emailNFe } from "./emailNFe.js";
import { emailReceivable } from "./emailReceivable.js";

export async function email(zenReq) {
  //
  if (zenReq.body?.context?.event === "/fiscal/br/dfeNfeProcOutOpConfirm") {
    return emailNFe(zenReq);
  }

  //
  if (zenReq.body?.context?.event === "/financial/billing/instructionResponseOpProcess") {
    return emailReceivable(zenReq);
  }
}