import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function outgoingInvoiceOpApprove_copyToVB(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const fiscalService = new Z.api.fiscal.FiscalService(z);

  const outgoingInvoice = await fiscalService.outgoingInvoiceReadById(zenReq.body.args.id);

  if (outgoingInvoice.company.id === 1001 && (outgoingInvoice.tags ?? "").split(",").includes("vendaCruzada")) {
    const items = await fiscalService.outgoingInvoiceItemRead(`q=outgoingInvoice.id==${outgoingInvoice.id}`);
    const payments = await fiscalService.outgoingInvoicePaymentRead(`q=outgoingInvoice.id==${outgoingInvoice.id}`);

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

    const tags = (outgoingInvoice.tags ?? "").split(",").filter(e => e);

    let outgoingInvoice1 = {
      ...outgoingInvoice,
      // TODO se passar o id o log registra neste id
      id: undefined,
      company: {
        id: 1002,
      },
      person: {
        id: 1004,
      },
      code: `VB:${outgoingInvoice.id}`,
      tags: tags.concat([`VB:${outgoingInvoice.id}`, "vendaCruzada"]).join(","),
    };

    // TODO está duplicando as formas de pagamento
    outgoingInvoice1 = await fiscalService.outgoingInvoiceOpCreate({
      outgoingInvoice: outgoingInvoice1,
      items: items,
      payments: payments,
    });
    outgoingInvoice1 = await fiscalService.outgoingInvoiceOpPrepare(outgoingInvoice1.id);
    outgoingInvoice1 = await fiscalService.outgoingInvoiceOpApprove(outgoingInvoice1.id);
  }
}