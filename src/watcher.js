import { productPackingCreate } from "./catalog/product/productPackingCreate.js";
import { notifyBackloggedSales } from "./custom/notifyBackloggedSales.js";
import { userLogCreate } from "./system/audit/userLogCreate.js";

export async function watch(zenReq) {
  let zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.body?.context?.event === "/catalog/product/productPackingCreate"
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    zenRes = {
      ...zenRes,
      ...await productPackingCreate(zenReq),
    };
  }

  if (zenReq.body?.context?.event === "/system/audit/userLogCreate"
    && (zenReq.body?.context?.tags ?? []).includes("after")) {
    zenRes = {
      ...zenRes,
      ...await userLogCreate(zenReq),
    };
  }

  if (zenReq.body?.context?.event === "/custom/notifyBackloggedSales") {
    zenRes = {
      ...zenRes,
      ...await notifyBackloggedSales(zenReq),
    };
  }

  return zenRes;
}
