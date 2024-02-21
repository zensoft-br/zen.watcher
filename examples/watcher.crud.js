// Exemplo de ZenReq para a operação /sale/saleOpPrepare
// const z_req = {
//   method: "POST",
//   path: "/sale/saleUpdate",
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
//       bean: {
//         id: 1001,
//         company: {
//           id: 1001,
//           // ...demais propriedades
//         },
//         person: {
//           id: 1001,
//           // ...demais propriedades
//         },
//         code: "code",
//         date: "2024-01-01",
//         totalValue: 1000,
//         // ...demais propriedades
//       },
//     },
//   },
// };

export async function watch(z_req) {
  if (z_req.body?.context?.event === "/sale/saleUpdate" && (z_req.body?.context?.tags ?? []).includes("before")) {
    // O bean vem informado no body nas operações de CRUD
    const sale = z_req.body.args.bean;

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
