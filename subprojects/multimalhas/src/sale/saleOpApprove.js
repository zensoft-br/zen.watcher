import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function saleOpApprove(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const saleService = new Z.api.sale.SaleService(z);
  const materialService = new Z.api.material.MaterialService(z);
  const fiscalService = new Z.api.fiscal.FiscalService(z);

  const sale = await saleService.saleReadById(zenReq.body.args.id);

  /*
   * Quando um pedido de venda é aprovado,
   * os itens do pedido são alimentados no estoque.
   */
  const properties = {};
  const tags = [];
  tags.push("saleOpApprove");
  tags.push(`saleID:${sale.id}`);
  properties["saleID"] = sale.id;
  let incomingList = {
    company: {id: sale.company.id},
    person: {id: sale.company.person.id},
    tags: tags.join(),
    properties
  };

  // insere o cabeçalho do romaneio
  incomingList = await materialService.incomingListCreate(incomingList);
  
  // insere os itens do romaneio
  const saleItems = await saleService.saleItemRead(`q=sale.id==${sale.id}`);
  for (const e of saleItems) {
    let incomingListItem = {
      incomingList,
      productPacking: e.productPacking,
      quantity: e.quantity
    }    
    incomingListItem = await materialService.incomingListItemCreate(incomingListItem);
  };

  // finaliza a preparação do romaneio
  incomingList = await materialService.incomingListOpPrepare(incomingList.id);

  // gera a nota fiscal de entrada
  let incomingInvoice = {
    incomingListId: incomingList.id,
    fiscalProfileOperationId: 1077,
    priceListId: 1001,
    group: false,
  }
  incomingInvoice = await fiscalService.incomingInvoiceOpCreateFromIncomingList(incomingInvoice);
  // atribui o ID do romaneio como número da nota
  incomingInvoice.number = incomingList.id; 
  incomingInvoice = await fiscalService.incomingInvoiceUpdate(incomingInvoice);

  // altera a CFOP dos itens da nota
  const incomingInvoiceItems = await fiscalService.incomingInvoiceItemRead(`q=invoice.id==${incomingInvoice.id}`);
  for (const e of incomingInvoiceItems) {
    e.taxationOperation = {id: 1001};
    await fiscalService.incomingInvoiceItemUpdate(e);
  }

  // finaliza a preparação da nota fiscal
  incomingInvoice = await fiscalService.incomingInvoiceOpPrepare(incomingInvoice.id);

  // aprova a nota fiscal de entrada
  incomingInvoice = await fiscalService.incomingInvoiceOpApprove(incomingInvoice.id);
}