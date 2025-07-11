import { createLambdaHandler } from "../../../shared/src/AwsLambda.js";
import { productPackingCreate } from "./catalog/product/productPackingCreate.js";
import { notifyBackloggedSales } from "./custom/notifyBackloggedSales.js";
import { payableRead } from "./financial/payableRead.js";
import { saleCreate } from "./sale/saleCreate.js";
import { saleOpPrepare } from "./sale/saleOpPrepare.js";
import { userLogCreate } from "./system/audit/userLogCreate.js";
import { workpieceOpForward } from "./system/workflow/workpieceOpForward.js";

export const schema = {
  version: "1.0",
  watchers: [
    {
      description: "Watch for sale creation to prepare the sale operation",
      events: ["/catalog/product/productPackingCreate"],
      path: "/",
      tags: ["before"],
    },
    {
      description: "Watch for user log creation to perform additional actions",
      events: ["/system/audit/userLogCreate"],
      path: "/",
      tags: ["after"],
    },
    {
      description: "Notify about backlogged sales by updating their tags",
      path: "/custom/notifyBackloggedSales",
    },
    {
      description: "Watch for workpiece operation forwarding to perform additional actions",
      events: ["/system/workflow/workpieceOpForward"],
      path: "/",
      tags: ["after"],
    },
    {
      description: "Read financial payable data before processing",
      events: ["/financial/payableRead"],
      path: "/",
      tags: ["before"],
    },
    {
      description: "Prepare sale operation before creating a sale",
      events: ["/sale/saleCreate"],
      path: "/",
      tags: ["before"],
    },
    {
      description: "Prepare sale operation before processing sale operations",
      events: ["/sale/saleOpPrepare"],
      path: "/",
      tags: ["before"],
    },
  ]
};

export async function watcher(zenReq) {
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

  if (zenReq.body.context.event === "/financial/payableRead"
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await payableRead(zenReq);
  }

  if (zenReq.body?.context?.event === "/sale/saleCreate"
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    zenRes = await saleCreate(zenReq);
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

export const handler = createLambdaHandler({ watcher, schema });
