import { createLambdaHandler } from "../../../shared/src/AwsLambda.js";
import { dfeNfeProcOutOpAuthorize } from "./dfeNfeProcOutOpAuthorize.js";
import { pickingOrderOpApprove } from "./material/pickingOrderOpApprove.js";
import { normalize } from "./normalize.js";
import { logOpDeleteExpired } from "./system/audit/logOpDeleteExpired.js";
import { databaseOpOptimize } from "./system/databaseOpOptimize.js";
import { mail } from "./system/integration/mail.js";
import { email } from "./system/mail/email.js";
import { print } from "./system/report/print.js";
import { companyAccessControl } from "./system/security/companyAccessControl.js";
import { salespersonAccessControl } from "./system/security/salespersonAccessControl.js";

export const schema = {
  version: "1.1",
  watchers: [
    {
      description: "Handle email operations",
      path: "/email",
      action: (zenReq) => email(zenReq),
    },
    {
      description: "Authorize outgoing invoice operation for NF-e",
      path: "/fiscal/br/out/authorize",
      events: ["/fiscal/outgoingInvoiceOpApprove"],
      action: (zenReq) => dfeNfeProcOutOpAuthorize(zenReq),
    },
    {
      description: "Handle mail operations",
      path: "/mail",
      action: (zenReq) => mail(zenReq),
    },
    {
      description: "Approve picking order operation",
      path: "/",
      events: ["/material/pickingOrderOpApprove"],
      action: (zenReq) => pickingOrderOpApprove(zenReq),
    },
    {
      description: "Normalize data",
      path: "/normalize",
      action: (zenReq) => normalize(zenReq),
    },
    {
      description: "Print documents",
      path: "/print",
      action: (zenReq) => print(zenReq),
    },
    {
      description: "Delete expired logs",
      path: "/system/audit/logOpDeleteExpired",
      action: (zenReq) => logOpDeleteExpired(zenReq),
    },
    {
      description: "Optimize database operations",
      path: "/system/databaseOpOptimize",
      action: (zenReq) => databaseOpOptimize(zenReq),
    },
    {
      description: "Restrict access to company-related data",
      path: "/system/security/companyAccessControl",
      events: [
        "/commercial/contract/contractRead",
        "/financial/accounting/journalEntryRead",
        "/financial/accounting/ledgerItemRead",
        "/financial/accounting/ledgerItemBalanceRead",
        "/financial/billing/walletRead",
        "/financial/payableRead",
        "/financial/payableSettlementRead",
        "/financial/receivableRead",
        "/financial/receivableSettlementRead",
        "/financial/treasury/accountStatementRead",
        "/fiscal/br/dfeRead",
        "/fiscal/br/dfeNfeProcInRead",
        "/fiscal/br/dfeNfeProcOutRead",
        "/fiscal/br/dfeProcEventoNFeInRead",
        "/fiscal/br/dfeProcEventoNFeOutRead",
        "/fiscal/br/dfeProcInutNFeRead",
        "/fiscal/br/dfeResEventoRead",
        "/fiscal/br/dfeResNFeInRead",
        "/fiscal/fiscalYearRead",
        "/fiscal/incomingInvoiceRead",
        "/fiscal/invoiceSeriesRead",
        "/fiscal/outgoingInvoiceRead",
        "/logistic/shippingRead",
        "/material/incomingListRead",
        "/material/inventoryRead",
        "/material/movingOrderRead",
        "/material/outgoingListRead",
        "/material/pickingOrderRead",
        "/material/reservationRead",
        "/material/stockAvailabilityRead",
        "/sale/quoteRead",
        "/sale/saleRead",
        "/shipping/shipmentRead",
        "/supply/production/productionOrderRead",
        "/supply/purchase/purchaseRead",
        "/supply/purchase/quoteRead",
      ],
      tags: ["before"],
      action: (zenReq) => companyAccessControl(zenReq),
    },
    {
      description: "Restrict access to salesperson-related data",
      path: "/system/security/salespersonAccessControl",
      events: [
        "/catalog/person/personRead",
        "/financial/payableRead",
        "/financial/receivableRead",
        "/fiscal/incomingInvoiceRead",
        "/fiscal/outgoingInvoiceRead",
        "/sale/quoteRead",
        "/sale/saleRead",
        "/system/data/dataSourceOpRead",
      ],
      tags: ["before"],
      action: (zenReq) => salespersonAccessControl(zenReq),
    },
  ],
};

export async function watcher(zenReq) {
  let zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.path === "/email") {
    zenRes = await email(zenReq);
  } else if (zenReq.path === "/fiscal/br/out/authorize"
    && zenReq.body?.context?.event == "/fiscal/outgoingInvoiceOpApprove") {
    zenRes = await dfeNfeProcOutOpAuthorize(zenReq);
  }

  if (zenReq.path.startsWith("/mail")) {
    return mail(zenReq);
  } else if (zenReq.body?.context?.event == "/material/pickingOrderOpApprove") {
    zenRes = await pickingOrderOpApprove(zenReq);
  } else if (zenReq.path === "/normalize") {
    zenRes = normalize(zenReq);
  } else if (zenReq.path === "/print") {
    zenRes = await print(zenReq);
  } else if (zenReq.path === "/system/audit/logOpDeleteExpired") {
    zenRes = await logOpDeleteExpired(zenReq);
  } else if (zenReq.path === "/system/databaseOpOptimize") {
    zenRes = await databaseOpOptimize(zenReq);
  }

  if (zenReq.path === "/system/security/companyAccessControl" &&
    [
      "/commercial/contract/contractRead",
      "/financial/accounting/journalEntryRead",
      "/financial/accounting/ledgerItemRead",
      "/financial/accounting/ledgerItemBalanceRead",
      "/financial/billing/walletRead",
      "/financial/payableRead",
      "/financial/payableSettlementRead",
      "/financial/receivableRead",
      "/financial/receivableSettlementRead",
      "/financial/treasury/accountStatementRead",
      "/fiscal/br/dfeRead",
      "/fiscal/br/dfeNfeProcInRead",
      "/fiscal/br/dfeNfeProcOutRead",
      "/fiscal/br/dfeProcEventoNFeInRead",
      "/fiscal/br/dfeProcEventoNFeOutRead",
      "/fiscal/br/dfeProcInutNFeRead",
      "/fiscal/br/dfeResEventoRead",
      "/fiscal/br/dfeResNFeInRead",
      "/fiscal/fiscalYearRead",
      "/fiscal/incomingInvoiceRead",
      "/fiscal/invoiceSeriesRead",
      "/fiscal/outgoingInvoiceRead",
      "/logistic/shippingRead",
      "/material/incomingListRead",
      "/material/inventoryRead",
      "/material/movingOrderRead",
      "/material/outgoingListRead",
      "/material/pickingOrderRead",
      "/material/reservationRead",
      "/material/stockAvailabilityRead",
      "/sale/quoteRead",
      "/sale/saleRead",
      "/shipping/shipmentRead",
      "/supply/production/productionOrderRead",
      "/supply/purchase/purchaseRead",
      "/supply/purchase/quoteRead",
    ].includes(zenReq.body.context.event)
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return companyAccessControl(zenReq);
  }

  if (zenReq.path === "/system/security/salespersonAccessControl" &&
    [
      "/catalog/person/personRead",
      "/financial/payableRead",
      "/financial/receivableRead",
      "/fiscal/incomingInvoiceRead",
      "/fiscal/outgoingInvoiceRead",
      "/sale/quoteRead",
      "/sale/saleRead",
      "/system/data/dataSourceOpRead",
    ].includes(zenReq.body.context.event)
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    return salespersonAccessControl(zenReq);
  }

  return zenRes;
}

export const handler = createLambdaHandler({ watcher, schema });
