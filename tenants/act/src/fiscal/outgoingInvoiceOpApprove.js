import * as Z from "@zensoftbr/zenerpclient";
import "dotenv/config";

export async function outgoingInvoiceOpApprove(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const fiscalService = new Z.api.fiscal.FiscalService(z);

  const outgoingInvoice = await fiscalService.outgoingInvoiceReadById(zenReq.body.args.id);

  if (outgoingInvoice.fiscalProfileOperation.code.includes("Remessa")) {
    const invoicePaymentList = await fiscalService.outgoingInvoicePaymentRead(`q=invoice.id==${outgoingInvoice.id}`);
    for (const invoicePayment of invoicePaymentList) {
      if (invoicePayment.type === "BILLING_TITLE")
        throw new Error("As formas de pagamento de notas fiscais de remessa não podem gerar títulos");
    }
  }
}