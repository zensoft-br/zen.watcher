import "dotenv/config";
import { createFromToken } from "@zensoftbr/zenerpclient";
import { FiscalService } from "@zensoftbr/zenerpclient/api/fiscal/FiscalService";
import { FiscalBrService } from "@zensoftbr/zenerpclient/api/fiscal/br/FiscalBrService";
import { SaleService } from "@zensoftbr/zenerpclient/api/sale/SaleService";

/*
 * This watcher process a sale automatically when it is approved
 * It must be run after a /sale/saleOpProcess event
 */
export async function saleOpApprove(zenReq) {
  const z = createFromToken(zenReq.body.context.tenant, process.env.token);

  const fiscalService = new FiscalService(z);
  const fiscalBrService = new FiscalBrService(z);
  const saleService = new SaleService(z);

  const sale = await saleService.saleReadById(zenReq.body.args.id);

  // Check saleProfile tag saleOpForwardAuto
  if (!(sale.saleProfile.tags ?? "").split(",").includes("saleOpForwardAuto"))
    return;

  // outgoingInvoice
  let outgoingInvoice = await saleService.saleOpForwardAuto(zenReq.body.args.id, {});

  outgoingInvoice = await fiscalService.outgoingInvoiceOpPrepare(outgoingInvoice.id);
  outgoingInvoice = await fiscalService.outgoingInvoiceOpApprove(outgoingInvoice.id);

  // dfe
  let dfe = await fiscalBrService.dfeNfeProcOutOpCreate(outgoingInvoice.id);
  dfe = await fiscalBrService.dfeNfeProcOutOpSign(dfe.id);
  dfe = await fiscalBrService.dfeNfeProcOutOpTransmit(dfe.id);
  if (dfe.status === "SENT")
    await fiscalBrService.dfeNfeProcOutOpConfirm(dfe.id);
}