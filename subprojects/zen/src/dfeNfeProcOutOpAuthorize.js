import { createFromToken } from "@zensoftbr/zenerpclient";
import { FiscalBrService } from "@zensoftbr/zenerpclient/api/fiscal/br/FiscalBrService";

export async function dfeNfeProcOutOpAuthorize(zenReq) {
  const z = createFromToken(zenReq.body.context.tenant, process.env.token);

  const fiscalBrService = new FiscalBrService(z);

  let dfe = await fiscalBrService.dfeNfeProcOutOpCreate(zenReq.body.args.id);
  dfe = await fiscalBrService.dfeNfeProcOutOpSign(dfe.id);
  dfe = await fiscalBrService.dfeNfeProcOutOpTransmit(dfe.id);
  if (dfe.status === "SENT") {
    await fiscalBrService.dfeNfeProcOutOpConfirm(dfe.id);
  }
}