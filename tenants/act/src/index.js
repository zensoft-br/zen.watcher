// import * as Z from "@zensoftbr/zenerpclient";

import { saleCreate } from "./saleCreate.js";
import { outgoingInvoiceOpPrepare } from "./outgoingInvoiceOpPrepare.js";
import { saleOpApprove } from "./saleOpApprove.js";
import { outgoingInvoiceOpApprove } from "./outgoingInvoiceOpApprove.js";
import { creditLineOpInactivate } from "./financial/credit/creditLineOpInactivate.js";

export async function watcher(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.path === "/financial/credit/creditLineOpInactivate") {
    return creditLineOpInactivate(zenReq);
  }

  // Validações ao aprovar nota fiscal de saída
  if (zenReq.body?.context?.event === "/fiscal/outgoingInvoiceOpPrepare" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await outgoingInvoiceOpPrepare(zenReq);
  }

  // Validações ao aprovar nota fiscal de saída
  if (zenReq.body?.context?.event === "/fiscal/outgoingInvoiceOpApprove" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await outgoingInvoiceOpApprove(zenReq);
  }

  // adicionar observação fixa ao inserir o pedido de venda
  if (zenReq.body?.context?.event === "/sale/saleCreate" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await saleCreate(zenReq);
  }

  // Validações ao aprovar pedido de venda
  if (zenReq.body?.context?.event === "/sale/saleOpApprove" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await saleOpApprove(zenReq);
  }

  return zenRes;
}

export const handler = createLambdaHandler(watcher);
