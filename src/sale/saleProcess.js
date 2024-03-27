import * as Z from "@zensoftbr/zenerpclient";

/*
 * This watcher process a sale automatically when it is approved
 * It must be run after a /sale/saleOpProcess event
 */
export async function saleProcess(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, zenReq.body.context.token);

  if (zenReq.body?.context?.event !== "/sale/saleOpApprove")
    throw new Error(`Unsupported event, expected /sale/saleOpProcess, received ${zenReq.body?.context?.event}`);

  const fiscalService = new Z.api.fiscal.FiscalService(z);
  const fiscalBrService = new Z.api.fiscal.br.FiscalBrService(z);
  const materialService = new Z.api.material.MaterialService(z);
  const saleService = new Z.api.sale.SaleService(z);

  let sale = await saleService.saleOpReleaseForPicking(zenReq.body.args.id);

  // Check if there are saleProfile restrictions
  if (zenReq.query?.saleProfileIds) {
    if (!zenReq.query?.saleProfileIds.split(",").includes(String(sale.saleProfile.id)))
      return;
  }

  await materialService.outgoingRequestOpForwardAuto(sale.outgoingRequest.id, {
    step: "INVOICE_APPROVE",
  });

  sale = await saleService.saleReadById(sale.id);

  const outgoingInvoice = (await fiscalService.outgoingInvoiceRead(`q=outgoingList.id==${sale.outgoingRequest.unique?.outgoingListId}`))[0];

  let dfe = await fiscalBrService.dfeNfeProcOutOpCreate(outgoingInvoice.id);
  dfe = await fiscalBrService.dfeNfeProcOutOpSign(dfe.id);
  dfe = await fiscalBrService.dfeNfeProcOutOpTransmit(dfe.id);
  await fiscalBrService.dfeNfeProcOutOpConfirm(dfe.id);
}