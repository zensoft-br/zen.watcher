import { productPackingCreate } from "./catalog/product/productPackingCreate.js";
import { notifyBackloggedSales } from "./custom/notifyBackloggedSales.js";
import { saleOpPrepare } from "./sale/saleOpPrepare.js";
import { userLogCreate } from "./system/audit/userLogCreate.js";
import { workpieceOpForward } from "./system/workflow/workpieceOpForward.js";

export async function watch(zenReq) {
  let zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.body?.context?.event === "/catalog/product/productPackingCreate"
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    const result = await productPackingCreate(zenReq);
    if (result) {
      zenRes = {
        ...zenRes,
        ...result,
      };
    }
  }

  if (zenReq.body?.context?.event === "/system/audit/userLogCreate"
    && (zenReq.body?.context?.tags ?? []).includes("after")) {
    const result = await userLogCreate(zenReq);
    if (result) {
      zenRes = {
        ...zenRes,
        ...result,
      };
    }
  }

  if (zenReq.path === "/custom/notifyBackloggedSales") {
    const result = await notifyBackloggedSales(zenReq);
    if (result) {
      zenRes = {
        ...zenRes,
        ...result,
      };
    }
  }

  if (zenReq.body?.context?.event === "/system/workflow/workpieceOpForward"
    && (zenReq.body?.context?.tags ?? []).includes("after")) {
    const result = await workpieceOpForward(zenReq);
    if (result) {
      zenRes = {
        ...zenRes,
        ...result,
      };
    }
  }

  if (zenReq.body?.context?.event === "/sale/saleOpPrepare"
  && (zenReq.body?.context?.tags ?? []).includes("before")) {
    const result = await saleOpPrepare(zenReq);
    if (result) {
      zenRes = {
        ...zenRes,
        ...result,
      };
    }
  }

  return zenRes;
}
