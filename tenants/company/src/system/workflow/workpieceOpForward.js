import * as Z from "@zensoftbr/zenerpclient";

/*
 * Este watcher monitora quando um status customizado de um pedido de venda
 * é avançado, e limpa as tags "atrasado" e "urgente"
 */
export async function workpieceOpForward(zenReq) {
  const body = zenReq.body;

  const workpieceNode = new Z.api.system.workflow.WorkpieceNode();
  Object.assign(workpieceNode, body?.result);

  if (!workpieceNode?.workpiece?.source?.startsWith("/sale/sale:"))
    return;

  const client = Z.createFromToken(body.context.tenant, process.env.token);

  const saleService = new Z.api.sale.SaleService(client);
  let sale = await saleService.saleReadById(workpieceNode.workpiece.source.split(":")[1]);

  const tags = (sale.tags ?? "").split(",")
    .filter(e=>e)
    .filter(e => e !== "atrasado")
    .filter(e => e !== "urgente")
    .join(",") || undefined;
  if (tags !== sale.tags) {
    sale.tags = tags;
    sale = await saleService.saleOpUpdatePrepared(sale);

    console.log(`Pedido de venda ${sale.id}, tags "atrasado" e "urgente" removidas`);

    return {
      statusCode: 200,
    };
  }
}