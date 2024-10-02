import "dotenv/config";
import { createFromToken } from "@zensoftbr/zenerpclient";
import { SaleService } from "@zensoftbr/zenerpclient/api/sale/SaleService";

export async function saleOpPrepare(zenReq) {
  if (zenReq.body?.context?.event !== "/sale/saleOpPrepare")
    return;

  if (!(zenReq.body?.context?.tags ?? []).includes("before"))
    return;

  const id = zenReq.body.args.id;

  const z = createFromToken(zenReq.body.context.tenant, process.env.token);

  const saleService = new SaleService(z);

  const sale = await saleService.saleReadById(id);
  const salePaymentList = await saleService.salePaymentRead(`q=sale.id==${id}`);
  let antecipado = false;

  // Pedido antecipado
  if (salePaymentList.length == 1 && salePaymentList[0].term == 0) {
    // Adiciona a tag antecipado
    sale.tags = (sale.tags ?? "").split(",").filter((e) => e).concat("antecipado").join(",");
    antecipado = true;

    await saleService.saleUpdate(sale);
  }

  // Comissao
  // {
  //   const saleItemList = await saleService.saleItemRead(`q=sale.id==${id}`);

  //   for (const saleItem of saleItemList) {
  //     const priceListValue = (antecipado ? Math.round(saleItem.priceListValue * 0.96 * 100) / 100 : saleItem.priceListValue);
  //     let salesCommission = 6;

  //     if (priceListValue > saleItem.unitValue) {
  //       const discountValue = Math.round((priceListValue - saleItem.unitValue) / priceListValue * 10000) / 100;

  //       if (discountValue > 20)
  //         salesCommission = 0;
  //       else if (discountValue > 19)
  //         salesCommission = 1;
  //       else if (discountValue > 18)
  //         salesCommission = 1;
  //       else if (discountValue > 17)
  //         salesCommission = 1;
  //       else if (discountValue > 16)
  //         salesCommission = 1;
  //       else if (discountValue > 15)
  //         salesCommission = 1;
  //       else if (discountValue > 14)
  //         salesCommission = 1.5;
  //       else if (discountValue > 13)
  //         salesCommission = 1.8;
  //       else if (discountValue > 12)
  //         salesCommission = 2.1;
  //       else if (discountValue > 11)
  //         salesCommission = 2.4;
  //       else if (discountValue > 10)
  //         salesCommission = 2.7;
  //       else if (discountValue > 9)
  //         salesCommission = 3;
  //       else if (discountValue > 8)
  //         salesCommission = 3.3;
  //       else if (discountValue > 7)
  //         salesCommission = 3.6;
  //       else if (discountValue > 6)
  //         salesCommission = 3.9;
  //       else if (discountValue > 5)
  //         salesCommission = 4.2;
  //       else if (discountValue > 4)
  //         salesCommission = 4.5;
  //       else if (discountValue > 3)
  //         salesCommission = 4.8;
  //       else if (discountValue > 2)
  //         salesCommission = 5.1;
  //       else if (discountValue > 1)
  //         salesCommission = 5.4;
  //       else if (discountValue > 0)
  //         salesCommission = 5.7;
  //     }

  //     // const properties = saleItem.properties == null ? {} : saleItem.properties;
  //     // properties.salesCommission = salesCommission;
  //     // saleItem.properties = properties;

  //     saleItem.properties = {
  //       ...saleItem.properties,
  //       salesCommission: salesCommission,
  //     };

  //     await saleService.saleItemUpdate(saleItem);
  //   }
  // }
}