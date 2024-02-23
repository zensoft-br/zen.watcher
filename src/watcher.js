import Z from "@zensoft-br/zenclient";

// eslint-disable-next-line no-unused-vars
export async function watch(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

  // aprovar o pedido de venda
  // POST /sale/saleOpApprove/1167

  if (zenReq.body.context.event === "/catalog/product/productUpdate") {
    if (zenReq.query.case === "upper")
      zenReq.body.args.bean.description = zenReq.body.args.bean.description.toUpperCase();

    if (zenReq.query.case === "lower")
      zenReq.body.args.bean.description = zenReq.body.args.bean.description.toLowerCase();

    // Envia o bean dentro do args do body
    zenRes.body.args = zenReq.body.args;
  }

  if (zenReq.body.context.event === "/sale/saleOpApprove") {
    //
  }

  if (zenReq.path === "/print") {
    // zenReq.body.args.id;
    // zenReq.query.reportCode;
    // zenReq.query.printerCode;
    // zenReq.query.dataSourceCode;
    // zenReq.query.paramName;
    // zenReq.query.paramType;

    // emitir o impresso e enviar para a impressora
  }

  if (zenReq.body.context.event === "/sale/saleOpPrepare") {
    const zenClient = Z.createFromToken("teste", zenReq.body.context.token);
    const saleService = new Z.api.sale.Service(zenClient);

    const sale = await saleService.saleReadById(zenReq.body.args.id);

    // let response = await fetch(`https://teste.zenerp.app.br:8443/sale/sale/${zenReq.body.args.id}`, {
    //   method: "GET",
    //   headers: {
    //     authorization: `Bearer ${zenReq.body.context.token}`,
    //   },
    // });
    // const sale = await response.json();

    if (sale.totalValue >= 2000) {
      await saleService.saleOpApprove(zenReq.body.args.id);

      // response = await fetch(`https://teste.zenerp.app.br:8443/sale/saleOpApprove/${zenReq.body.args.id}`, {
      //   method: "POST",
      //   headers: {
      //     authorization: `Bearer ${zenReq.body.context.token}`,
      //   },
      // });
    }

    // zenRes.statusCode = response.status;
  }

  // console.log(zenReq);

  // console.log(`Evento ${zenReq.body.context.event} recebido, para o pedido de venda ${zenReq.body.args.id}`);

  return zenRes;
}
