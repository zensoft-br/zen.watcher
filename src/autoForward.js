// DEPRECATED?

import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";
import { SaleService } from "@zensoftbr/zenerpclient/api/sale/SaleService";
import { MaterialService } from "@zensoftbr/zenerpclient/api/material/MaterialService";
import { FiscalService } from "@zensoftbr/zenerpclient/api/fiscal/FiscalService";

export async function autoForward(zenReq) {
  if (zenReq.body?.context?.event == "/sale/saleOpApprove" && zenReq.body?.context?.tags?.includes("after")) {
    return autoForwardSaleOpApprove(zenReq);
  }
}

async function autoForwardSaleOpApprove(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const fiscalService = new FiscalService(z);
  const materialService = new MaterialService(z);
  const saleService = new SaleService(z);

  const sale = await saleService.saleReadById(zenReq.body.args.id);

  if ((sale.saleProfile.tags ?? "").split(",").includes("saleOpPickingOrderCreateAuto")) {
    const pickingOrder = await saleService.saleOpPickingOrderCreate(sale.id, {
      pickingProfileId: sale.saleProfile.pickingProfile?.id,
      // addressId:
      shipmentId: sale.shipment?.id,
      volumeCount: sale.properties?.volumeCount,
      tags: sale.tags,
      // properties:
      // items:
    });
  } else
    return;

  const pickingProfileTags = (pickingOrder.pickingProfile.tags ?? "").split(",");

  if (pickingProfileTags.includes("reservationOpStartAuto")) {
    await materialService.reservationOpStart(pickingOrder.reservation.id);
  } else
    return;

  if (pickingProfileTags.includes("reservationOpAllocateAuto")) {
    await materialService.reservationOpAllocateAuto(pickingOrder.reservation.id);
  } else
    return;

  const outgoingListList = await materialService.outgoingListRead(`q=pickingOrder.id==${pickingOrder.id}`);

  if (pickingProfileTags.includes("volumeOpCreateAuto")) {
    for (const outgoingList of outgoingListList) {
      await materialService.outgoingListOpVolumeCreateAuto(outgoingList.id, {
        quantity: pickingOrder.properties?.volumeCount ?? 1,
      });
      // await materialService.outgoingListOpPacked(outgoingList.id);
    }
  } else
    return;

  const outgoingInvoiceList = [];

  if (pickingProfileTags.includes("outgoingListOpOutgoingInvoiceCreateAuto")) {
    for (const outgoingList of outgoingListList) {
      outgoingInvoiceList.push( await materialService.outgoingListOpOutgoingInvoiceCreate(outgoingList.id, {
      }));
    }
  } else
    return;

  if (pickingProfileTags.includes("outgoingInvoiceOpPrepareAuto")) {
    for (const outgoingInvoice of outgoingInvoiceList) {
      await fiscalService.outgoingInvoiceOpPrepare(outgoingInvoice.id);
    }
  } else
    return;

  if (pickingProfileTags.includes("outgoingInvoiceOpApproveAuto")) {
    for (const outgoingInvoice of outgoingInvoiceList) {
      await fiscalService.outgoingInvoiceOpApprove(outgoingInvoice.id);
    }
  } else
    return;
}