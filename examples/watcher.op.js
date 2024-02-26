import Zen from "@zensoft-br/zenclient";

// Exemplo de ZenReq para a operação /sale/saleOpPrepare
// const zenReq = {
//   method: "POST",
//   path: "/sale/saleOpPrepare",
//   query: {},
//   headers: {
//     "content-type": "application/json",
//   },
//   body: {
//     context: {
//       tenant: "teste",
//       token: "...",
//       tags: ["before"],
//     },
//     args: {
//       id: 1001,
//     },
//   },
// };

export async function watch(zenReq) {
  if (zenReq.body?.context?.event === "/sale/saleOpPrepare" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    // Instancia o cliente Zen
    const zenClient = Zen.createFromToken(zenReq.body.context.tenant, zenReq.body.context.token);

    // Instancia o serviço sale.Service
    const saleService = new Zen.api.sale.Service(zenClient);

    // Carrega a venda (no body da operação vem apenas o id)
    const sale = await saleService.saleReadById(zenReq.body.args.id);

    // Se o valor total do pedido de venda for < 10000, adiciona uma observação no pedido de venda
    if (sale.totalValue < 10000) {
      sale.properties = {
        ...sale.properties,
        comments: "ATENÇÃO! O valor da venda é menor do que R$ 10.000",
      };

      // Atualiza o pedido de venda
      await saleService.saleUpdate(sale);
    }
  }
}
