import Zen from "@zensoft-br/zenclient";

// Exemplo de ZenReq para a operação /sale/saleOpPrepare
// const z_req = {
//   method: "POST",
//   path: "/sale/saleOpPrepare",
//   query: {},
//   headers: {
//     "content-type": "application/json",
//   },
//   body: {
//     context: {
//       tentant: "teste",
//       token: "...",
//       tags: ["before"],
//     },
//     args: {
//       id: 1001,
//     },
//   },
// };

export async function watch(z_req) {
  if (z_req.body?.context?.event === "/sale/saleOpPrepare" && (z_req.body?.context?.tags ?? []).includes("before")) {
    // Instancia o cliente Zen
    const zenClient = Zen.createFromToken(z_req.body.context.tenant, z_req.body.context.token);

    // Instancia o serviço sale.Service
    const saleService = new Zen.api.sale.Service(zenClient);

    // Carrega a venda (no body da operação vem apenas o id)
    const sale = await saleService.saleReadById(z_req.body.args.id);

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
