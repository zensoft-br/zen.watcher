watch({
  method: "POST",
  path: "/sale/saleUpdate",
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
      bean: {
        id: 1001,
        company: {
          id: 1001,
        },
        person: {
          id: 1001,
        },
        code: "code",
        date: "2024-01-01",
        totalValue: 1000,
      },
    },
  },
});

export async function watch(zenReq) {
  if (zenReq.body?.context?.event === "/sale/saleUpdate" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    // O bean vem informado no body nas operações de CRUD
    const sale = zenReq.body.args.bean;

    // Se o valor total do pedido de venda for < 10000, adiciona uma observação no pedido de venda
    if (sale.totalValue < 10000) {
      sale.properties = {
        ...sale.properties,
        comments: "ATENÇÃO! O valor da venda é menor do que R$ 10.000",
      };

      // Retorna a venda modificada no body da reponse
      return {
        body: {
          args: {
            bean: sale,
          },
        },
      };
    }
  }
}
