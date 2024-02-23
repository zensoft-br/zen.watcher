import { emailNFe } from "./fiscalBrDfeNfeProcOutOpConfirm.js";

export async function email(zenReq) {
  if (zenReq.body?.context?.event === "/fiscal/br/dfeNfeProcOutOpConfirm") {
    return emailNFe(zenReq);
  }
}