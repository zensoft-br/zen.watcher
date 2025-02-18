import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function outgoingInvoiceOpApprove(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const fiscalService = new Z.api.fiscal.FiscalService(z);
  const saleService = new Z.api.sale.SaleService(z);

  const outgoingInvoice = await fiscalService.outgoingInvoiceReadById(zenReq.body.args.id);

  const [sale] = await saleService.saleRead(`q=outgoingInvoice.id==${outgoingInvoice.id}`);

  // VendaCruzada na empresa FS
  if (sale && sale.company.id === 1001 && sale.saleProfile.id === 1002) {
    const saleOriginal = await saleService.saleReadById(sale.properties.frigospol_sale_id_original);

    const items = await fiscalService.outgoingInvoiceItemRead(`q=outgoingInvoice.id==${outgoingInvoice.id}`);
    const payments = await fiscalService.outgoingInvoicePaymentRead(`q=invoice.id==${outgoingInvoice.id}`);

    // TODO se passar o id o log registra neste id
    items.forEach(e => {
      e.id = undefined;
      e.sale = undefined;
    });

    // TODO se passar o id o log registra neste id
    payments.forEach(e => {
      e.id = undefined;
      e.sale = undefined;
    });

    // const tags = (outgoingInvoice.tags ?? "").split(",").filter(e => e);

    // let outgoingInvoice1 = {
    //   ...outgoingInvoice,
    //   // TODO se passar o id o log registra neste id
    //   id: undefined,
    //   company: {
    //     id: 1002,
    //   },
    //   person: {
    //     id: 1004,
    //   },
    //   code: `VB:${outgoingInvoice.id}`,
    //   tags: tags.concat([`VB:${outgoingInvoice.id}`, "vendaCruzada"]).join(","),
    // };

    let incomingInvoice = {
      ...outgoingInvoice,
      // TODO se passar o id o log registra neste id
      id: undefined,
      company: saleOriginal.company,
      person: outgoingInvoice.company.person,
      number: undefined,
      properties: {
        ...outgoingInvoice.properties,
        frigospol_outgoingInvoice_id_original: outgoingInvoice.id,
      },
    };
    incomingInvoice = await fiscalService.incomingInvoiceOpCreate({
      invoice: incomingInvoice,
      itemList: items,
      paymentList: payments,
    });

    // // TODO está duplicando as formas de pagamento
    // outgoingInvoice1 = await fiscalService.outgoingInvoiceOpCreate({
    //   outgoingInvoice: outgoingInvoice1,
    //   items: items,
    //   payments: payments,
    // });
    // outgoingInvoice1 = await fiscalService.outgoingInvoiceOpPrepare(outgoingInvoice1.id);
    // outgoingInvoice1 = await fiscalService.outgoingInvoiceOpApprove(outgoingInvoice1.id);
  }
}