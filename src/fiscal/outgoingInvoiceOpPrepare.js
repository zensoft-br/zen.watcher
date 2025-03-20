import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function outgoingInvoiceOpPrepare(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const fiscalService = new Z.api.fiscal.FiscalService(z);
  const saleService = new Z.api.sale.SaleService(z);
  const purchaseService = new Z.api.supply.purchase.PurchaseService(z);

  let outgoingInvoice = await fiscalService.outgoingInvoiceReadById(zenReq.body.args.id);

  const [sale] = await saleService.saleRead(`q=outgoingInvoice.id==${outgoingInvoice.id}`);

  // VendaCruzada na empresa FS
  if (sale && sale.company.id === 1001 && sale.saleProfile.id === 1002) {
    const saleOriginal = await saleService.saleReadById(sale.properties.frigospol_sale_id_original);

    // Substitui a pessoa pela empresa vendedora
    outgoingInvoice.person = saleOriginal.company.person;
    outgoingInvoice = await fiscalService.outgoingInvoiceUpdate(outgoingInvoice);

    // Altera os valores unitários para o preço de custo
    const outgoingInvoiceItemList = await fiscalService.outgoingInvoiceItemRead(`q=outgoingInvoice.id==${outgoingInvoice.id}`);
    for (const outgoingInvoiceItem of outgoingInvoiceItemList) {
      const [priceListItem] = await purchaseService.priceListItemRead(`q=priceList.id=1001;productPacking.id==${outgoingInvoiceItem.productPacking.id}`);
      if (priceListItem) {
        outgoingInvoiceItem.unitValue = priceListItem.unitValue;
        await fiscalService.outgoingInvoiceItemUpdate(outgoingInvoiceItem);
      }
    }

    outgoingInvoice = await fiscalService.outgoingInvoiceReadById(outgoingInvoice.id);

    // Altera as formas de pagamento
    const outgoingInvoicePaymentList = await fiscalService.outgoingInvoicePaymentRead(`q=outgoingInvoice.id==${outgoingInvoice.id}`);
    for (const outgoingInvoicePayment of outgoingInvoicePaymentList) {
      await fiscalService.outgoingInvoicePaymentDelete(outgoingInvoicePayment);
    }
    fiscalService.outgoingInvoicePaymentCreate({
      invoice: outgoingInvoice,
      type: "PAYMENT",
      value: outgoingInvoice.totalValue,
    });

    // Recalcula a tributação
    outgoingInvoice = await fiscalService.outgoingInvoiceOpTaxationCalc(outgoingInvoice.id);
  }
}