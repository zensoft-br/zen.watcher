import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function saleOpApprove(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const saleService = new Z.api.sale.SaleService(z);

  const sale = await saleService.saleReadById(zenReq.body.args.id);

  /*
   * Quando um pedido de venda com o perfil de venda VendaCruzada é aprovado,
   * um clone deste pedido de venda é criado na empresa FS.
   */
  if (sale.saleProfile.id === 1002) {
    // Uma VendaCruzada na FS não será clonada
    if (sale.company.id === 1001)
      return;

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

    const tags = (sale.tags ?? "").split(",").filter(e => e);
    tags.push(sale.company.code);

    let sale1 = {
      ...sale,
      // TODO se passar o id o log registra neste id
      id: undefined,
      // FS
      company: {
        id: 1001,
      },
      tags: tags.join(","),
      properties: {
        ...sale.properties,
        frigospol_sale_id_original: sale.id,
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