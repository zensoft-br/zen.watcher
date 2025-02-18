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

    // if ((sale.priceList.code === 'ATA') || (sale.priceList.code === 'CON')) {
    //   delete sale.properties.salesCommission;
    // }

    await saleService.saleUpdate(sale);
  }

  // const saleItemList = await saleService.saleItemRead(`q=sale.id==${id}`);
  
  // for (const saleItem of saleItemList) {
  //   const priceListValue = (antecipado ? Math.round(saleItem.priceListValue * 0.96 * 100) / 100 : saleItem.priceListValue);
  //   if (saleItem.sale.priceList.code === 'ATA')
  //     saleItem.properties["salesCommission"] = await getComission('ATA', saleItem.unitValue, priceListValue);
  //   else if (saleItem.sale.priceList.code === 'CON')
  //     saleItem.properties["salesCommission"] = await getComission('CON', saleItem.unitValue, priceListValue);
  //   else
  //     return;
    
  //   await saleService.saleItemUpdate(saleItem);
  // }
}

// async function getComission(type, unitValue, priceListValue) {
//   const discountValue = Math.round((priceListValue - unitValue) / priceListValue * 10000) / 100;
//   if (type === 'ATA') {
//     if (discountValue > 10)
//       return 0;
//     else if (discountValue > 9)
//       return 1;
//     else if (discountValue > 8)
//       return 1.1;
//     else if (discountValue > 7)
//       return 1.2;
//     else if (discountValue > 6)
//       return 1.3;
//     else if (discountValue > 5)
//       return 1.4;
//     else if (discountValue > 4)
//       return 1.5;
//     else if (discountValue > 3)
//       return 1.8;
//     else if (discountValue > 2)
//       return 2.1;
//     else if (discountValue > 1)
//       return 2.4;
//     else if (discountValue > 0)
//       return 2.7;
//     else
//       return 3;
//   } else if (type === 'CON') {
//     if (discountValue > 10)
//       return 0;
//     else if (discountValue > 9)
//       return 3;
//     else if (discountValue > 8)
//       return 3.3;
//     else if (discountValue > 7)
//       return 3.6;
//     else if (discountValue > 6)
//       return 3.9;
//     else if (discountValue > 5)
//       return 4.2;
//     else if (discountValue > 4)
//       return 4.5;
//     else if (discountValue > 3)
//       return 4.8;
//     else if (discountValue > 2)
//       return 5.1;
//     else if (discountValue > 1)
//       return 5.4;
//     else if (discountValue > 0)
//       return 5.7;
//     else
//       return 6;
//   }    
// }
