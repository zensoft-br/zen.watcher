import "dotenv/config";
import { createFromToken } from "@zensoftbr/zenerpclient";
import { FiscalService } from "@zensoftbr/zenerpclient/api/fiscal/FiscalService";
// import { FiscalBrService } from "@zensoftbr/zenerpclient/api/fiscal/br/FiscalBrService";
import { MaterialService } from "@zensoftbr/zenerpclient/api/material/MaterialService";

/*
 * This watcher process a sale automatically when it is approved
 * It must be run after a /sale/saleOpProcess event
 */
export async function pickingOrderOpApprove(zenReq) {
  const z = createFromToken(zenReq.body.context.tenant, process.env.token);

  const fiscalService = new FiscalService(z);
  // const fiscalBrService = new FiscalBrService(z);
  const materialService = new MaterialService(z);

  // pickingOrder
  const pickingOrder = await materialService.pickingOrderReadById(zenReq.body.args.id);

  // Check pickingProfile tag pickingOrderForwardAuto
  if (!(pickingOrder.pickingProfile.tags ?? "").split(",").includes("pickingOrderForwardAuto"))
    return;

  // reservation
  let reservation = pickingOrder.reservation;
  reservation = await materialService.reservationOpStart(reservation.id);
  // reservation = 
  await materialService.reservationOpAllocateAuto(reservation.id);

  // outgoingList
  let outgoingList = pickingOrder.outgoingList;
  outgoingList = await materialService.outgoingListOpVolumeCreateAuto(outgoingList.id, {
    quantity: 1,
  });

  // outgoingInvoice
  let outgoingInvoice = await materialService.outgoingListOpOutgoingInvoiceCreate(outgoingList.id, {
  });
  outgoingInvoice = await fiscalService.outgoingInvoiceOpPrepare(outgoingInvoice.id);
  // outgoingInvoice =
  await fiscalService.outgoingInvoiceOpApprove(outgoingInvoice.id);

  // dfe
  // let dfe = await fiscalBrService.dfeNfeProcOutOpCreate(outgoingInvoice.id);
  // dfe = await fiscalBrService.dfeNfeProcOutOpSign(dfe.id);
  // dfe = await fiscalBrService.dfeNfeProcOutOpTransmit(dfe.id);
  // if (dfe.status === "SENT")
  //   await fiscalBrService.dfeNfeProcOutOpConfirm(dfe.id);
}