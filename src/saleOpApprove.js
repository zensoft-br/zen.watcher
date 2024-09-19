import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function saleOpApprove_cloneToFS(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const saleService = new Z.api.sale.SaleService(z);

  const sale = await saleService.saleReadById(zenReq.body.args.id);

  // VB, VendaCruzadaFS,
  if (sale.company.id === 1002 && sale.saleProfile.id === 1002) {
    const items = await saleService.saleItemRead(`q=sale.id==${sale.id}`);
    const payments = await saleService.salePaymentRead(`q=sale.id==${sale.id}`);

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

    // const tags = (sale.tags ?? "").split(",").filter(e => e);

    let sale1 = {
      ...sale,
      // TODO se passar o id o log registra neste id
      id: undefined,
      // FS
      company: {
        id: 1001,
      },
      // VendaCruzadaVB
      saleProfile: {
        id: 1003,
      },
      // tags: tags.concat("vendaCruzada").join(","),
      properties: {
        ...sale.properties,
        frigospol_sale_id: sale.id,
      },
    };

    sale1 = await saleService.saleOpCreate({
      sale: sale1,
      items: items,
      payments: payments,
    });
    sale1 = await saleService.saleOpPrepare(sale1.id);
    sale1 = await saleService.saleOpApprove(sale1.id);
  }
}