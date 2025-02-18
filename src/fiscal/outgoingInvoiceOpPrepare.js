import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function outgoingInvoiceOpPrepare(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const fiscalService = new Z.api.fiscal.FiscalService(z);
  const saleService = new Z.api.sale.SaleService(z);

  let outgoingInvoice = await fiscalService.outgoingInvoiceReadById(zenReq.body.args.id);

  const [sale] = await saleService.saleRead(`q=outgoingInvoice.id==${outgoingInvoice.id}`);

  // VendaCruzada na empresa FS
  if (sale && sale.company.id === 1001 && sale.saleProfile.id === 1002) {
    const saleOriginal = await saleService.saleReadById(sale.properties.frigospol_sale_id_original);

    // Substitui a pessoa pela empresa vendedora
    outgoingInvoice.person = saleOriginal.company.person;

    // TODO Altera os valores unitários

    // TODO Formas de pagamento

    outgoingInvoice = await fiscalService.outgoingInvoiceUpdate(outgoingInvoice);

    // Recalcula a tributação
    outgoingInvoice = await fiscalService.outgoingInvoiceOpTaxationCalc(outgoingInvoice.id);
  }
}