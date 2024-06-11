// import * as Z from "@zensoftbr/zenerpclient";

import { saleCreate } from "../saleCreate.js";
import { outgoingInvoiceOpApprove } from "./outgoingInvoiceOpApprove.js";

export async function watch(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

  // Validações ao aprovar nota fiscal de saída
  if (zenReq.body?.context?.event === "/fiscal/outgoingInvoiceOpAprove" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await outgoingInvoiceOpApprove(zenReq);
  }

  // adicionar observação fixa ao inserir o pedido de venda
  if (zenReq.body?.context?.event === "/sale/saleCreate" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await saleCreate(zenReq);
  }

  return zenRes;
}
