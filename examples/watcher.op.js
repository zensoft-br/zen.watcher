import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

watch({
  method: "POST",
  path: "/sale/saleOpPrepare",
  query: {},
  headers: {
    "content-type": "application/json",
  },
  body: {
    context: {
      tenant: "teste",
      token: "...",
      tags: ["before"],
    },
    args: {
      id: 1001,
    },
  },
});

export async function watch(zenReq) {
  if (zenReq.body?.context?.event === "/sale/saleOpPrepare" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    // Instancia o cliente Zen
    // Se for executar com o mesmo usuário do operador, utilize zenReq.body.context.token
    // Se for executar com o usuário automation@zensoft.com.br, utilize process.env.token
    const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

    // Instancia o serviço sale.Service
    const saleService = new Z.api.sale.SaleService(z);

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
