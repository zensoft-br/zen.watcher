import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function payableOpPrepare(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const id = zenReq.body.args.id;
  const payableService = new Z.api.financial.FinancialService(z);
  const systemService = new Z.api.system.file.FileService(z);
  const payable = await payableService.payableReadById(id);
  if (!payable || (payable?.tags ?? []).includes("#system")) {
    return;
  }
  if ((payable.incomingInvoice ?? payable.invoice) == null) {
    const [payableFile] = await systemService.fileRead(`q=source==/financial/payable:${payable.id}`);

    if (!payableFile) {
      throw new Error(`É necessário anexar um arquivo à conta a pagar (ID: ${id}).`);
    }
  }
}

