import { personRead } from "./catalog/person/personRead.js";
import { productCreateUpdate } from "./catalog/product/productCreateUpdate.js";
import { productPackingCreate } from "./catalog/product/productPackingCreate.js";
import { payableRead } from "./financial/payableRead.js";
import { receivableRead } from "./financial/receivableRead.js";
import { incomingInvoiceRead } from "./fiscal/incomingInvoiceRead.js";
import { outgoingInvoiceRead } from "./fiscal/outgoingInvoiceRead.js";
import { saleOpApprove } from "./sale/saleOpApprove.js";
import { saleOpCreate } from "./sale/saleOpCreate.js";
import { saleOpPrepare } from "./sale/saleOpPrepare.js";
import { purchaseRead } from "./supply/purchase/purchaseRead.js";
import { createLambdaHandler } from "../../../shared/src/AwsLambda.js";
import { receivableCreate } from "./financial/receivableCreate.js";

export const schema = {
  version: "1.0",
  watchers: [
    {
      description: "Restrict person read access based on custom conditions",
      events: ["/catalog/person/personRead"],
      path: "/",
      tags: ["before"],
    },
    {
      description: "Calculate and set product properties on creation or update",
      events: [
        "/catalog/product/productCreate",
        "/catalog/product/productUpdate",
      ],
      path: "/",
      tags: ["before"],
    },
    {
      description: "Calculate product packing code based on product and variant",
      events: ["/catalog/product/productPackingCreate"],
      path: "/",
      tags: ["before"],
    },
    {
      description: "Restrict financial payable read access based on custom conditions",
      events: ["/financial/payableRead"],
      path: "/",
      tags: ["before"],
    },
    {
      description: "Custom logic for financial receivable creation",
      events: ["/financial/receivableCreate"],
      path: "/",
      tags: ["before"],
    },
    {
      description: "Restrict financial receivable read access based on custom conditions",
      events: ["/financial/receivableRead"],
      path: "/",
      tags: ["before"],
    },
    {
      description: "Restrict fiscal incoming invoice read access based on custom conditions",
      events: ["/fiscal/incomingInvoiceRead"],
      path: "/",
      tags: ["before"],
    },
    {
      description: "Restrict fiscal outgoing invoice read access based on custom conditions",
      events: ["/fiscal/outgoingInvoiceRead"],
      path: "/",
      tags: ["before"],
    },
    {
      description: "Check sale operation approval conditions before approving",
      events: ["/sale/saleOpApprove"],
      path: "/",
      tags: ["before"],
    },
    {
      description: "Custom logic for sale operation creation",
      events: ["/sale/saleOpCreate"],
      path: "/",
      tags: ["before"],
    },
    {
      description: "Custom logic for sale operation preparation",
      events: ["/sale/saleOpPrepare"],
      path: "/",
      tags: ["before"],
    },
    {
      description: "Restrict purchase read access based on custom conditions",
      events: ["/supply/purchase/purchaseRead"],
      path: "/",
      tags: ["before"],
    },
  ],
};

export async function watcher(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.body.context.event === "/catalog/person/personRead"
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await personRead(zenReq);
  }

  if ((zenReq.body.context.event === "/catalog/product/productCreate"
    || zenReq.body.context.event === "/catalog/product/productUpdate")
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await productCreateUpdate(zenReq);
  }

  if (zenReq.body.context.event === "/catalog/product/productPackingCreate"
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await productPackingCreate(zenReq);
  }

  if (zenReq.body.context.event === "/financial/payableRead"
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await payableRead(zenReq);
  }

  if (zenReq.body.context.event === "/financial/receivableCreate"
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await receivableCreate(zenReq);
  }

  if (zenReq.body.context.event === "/financial/receivableRead"
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await receivableRead(zenReq);
  }

  if (zenReq.body.context.event === "/fiscal/incomingInvoiceRead"
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await incomingInvoiceRead(zenReq);
  }

  if (zenReq.body.context.event === "/fiscal/outgoingInvoiceRead"
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await outgoingInvoiceRead(zenReq);
  }

  if (zenReq.body.context.event === "/sale/saleOpApprove"
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await saleOpApprove(zenReq);
  }

  if (zenReq.body.context.event === "/sale/saleOpCreate"
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await saleOpCreate(zenReq);
  }

  if (zenReq.body.context.event === "/sale/saleOpPrepare"
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await saleOpPrepare(zenReq);
  }

  if (zenReq.body.context.event === "/supply/purchase/purchaseRead"
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return await purchaseRead(zenReq);
  }

  return zenRes;
}

export const handler = createLambdaHandler({ watcher, schema });
