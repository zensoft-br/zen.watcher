export async function saleCreate(zenReq) {
  const properties = zenReq.body.args.bean.properties ?? {};
  let comments = properties.comments ? `${properties.comments}\n\n` : "";
  comments = `${comments}******ATENÇÃO:******\n` +
  "Orientamos que seja feita a revisão e os testes de lavagem, encolhimento, costura, esgarçamento e/ou outros testes que acharem necessários antes da produção em escala das peças.\n" +
  "A devolução será aceita somente após constatado desacordo com o pedido ou defeito de fabricação do tecido no prazo de 30 dias a contar do recebimento da mesma.\n" +
  "Não aceitamos devolução de peças cortadas ou confeccionadas, peças violadas, e rolos sem etiqueta.\n" +
  "Para pedidos com pagamento antecipado, confirmar o valor com o financeiro - (47) 3342-0700.";
  properties.comments = comments;
  zenReq.body.args.bean.properties = properties;

  return {
    statusCode: 200,
    body: {
      args: zenReq.body.args,
    },
  };
}
