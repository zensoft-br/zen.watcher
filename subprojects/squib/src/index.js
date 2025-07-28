import { createLambdaHandler } from "../../../shared/src/AwsLambda.js";
import { pickingOrderOpReservationFinish } from "./material/pickingOrderOpReservationFinish.js";
import { quoteItemCreateUpdate } from "./sale/quoteItemCreateUpdate.js";
import { quoteItemProposalCreate } from "./sale/quoteItemProposalCreate.js";
import { quoteOpFill } from "./sale/quoteOpFill.js";
import { saleOpApprove_after } from "./sale/saleOpApprove_after.js";
import { saleOpApprove_before } from "./sale/saleOpApprove_before.js";

export const schema = {
  version: "1.0",
  watchers: [
    {
      description: "Handle picking order reservation finish",
      path:"/",
      events: ["/material/pickingOrderOpReservationFinish"],
      tags: ["after"],
    },
    {
      description: "Create quote item proposal",
      path:"/",
      events: ["/sale/quoteItemProposalCreate"],
      tags: ["before"],
    },
    {
      description: "Fill quote operation",
      path:"/",
      events: ["/sale/quoteOpFill"],
      tags: ["after"],
    },
    {
      description: "Approve sale operation",
      path:"/",
      events: ["/sale/saleOpApprove"],
      tags: ["after"],
    },
    {
      description: "Approve sale operation unconditionally",
      path:"/",
      events: ["/sale/saleOpApproveUnconditionally"],
      tags: ["after"],
    },
    {
      description: "Approve sale operation before",
      path:"/",
      events: ["/sale/saleOpApprove"],
      tags: ["before"],
    },
    {
      description: "Create or update quote item",
      path:"/sale/quoteItem",
      events: ["/sale/quoteItemCreate", "/sale/quoteItemUpdate"],
      tags: ["before"],
    }
  ]
};

export async function watcher(zenReq) {
  let zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.body?.context?.event === "/material/pickingOrderOpReservationFinish" && (zenReq.body?.context?.tags ?? []).includes("after")) {
    zenRes = await pickingOrderOpReservationFinish(zenReq);
  }

  if (zenReq.body?.context?.event === "/sale/quoteItemProposalCreate" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    zenRes = await quoteItemProposalCreate(zenReq);
  }

  if (zenReq.path === "/sale/quoteItem" 
    && ["/sale/quoteItemCreate", "/sale/quoteItemUpdate"].includes(zenReq.body?.context?.event) 
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return quoteItemCreateUpdate(zenReq);
  }

  if (zenReq.body?.context?.event === "/sale/quoteOpFill" && (zenReq.body?.context?.tags ?? []).includes("after")) {
    zenRes = await quoteOpFill(zenReq);
  }

  if (zenReq.body?.context?.event === "/sale/saleOpApprove" && (zenReq.body?.context?.tags ?? []).includes("after")) {
    zenRes = await saleOpApprove_after(zenReq);
  }

  if (zenReq.body?.context?.event === "/sale/saleOpApproveUnconditionally" && (zenReq.body?.context?.tags ?? []).includes("after")) {
    zenRes = await saleOpApprove_after(zenReq);
  }

  if (zenReq.body?.context?.event === "/sale/saleOpApprove" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    zenRes = await saleOpApprove_before(zenReq);
  }

  return zenRes;
}

export const handler = createLambdaHandler({ watcher, schema });
