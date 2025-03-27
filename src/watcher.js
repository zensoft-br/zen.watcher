import { saleOpCreate } from "./sale/saleOpCreate.js";
import { productPackingCreate } from "./catalog/product/productPackingCreate.js"
import { saleOpApprove } from "./sale/saleOpApprove.js";

// eslint-disable-next-line no-unused-vars
export async function watch(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.body.context.event === "/sale/saleOpApprove" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await saleOpApprove(zenReq);
  }

  if (zenReq.body.context.event === "/sale/saleOpCreate") {
    return await saleOpCreate(zenReq);
  }

  if (zenReq.body.context.event === "/catalog/product/productPackingCreate") {
    return await productPackingCreate(zenReq);
  }

  return zenRes;
}
