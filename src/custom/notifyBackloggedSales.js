import Z from "@zensoft-br/zenclient";

export async function notifyBackloggedSales(zenReq) {
  const body = zenReq.body;

  const client = Z.createFromToken(body.context.tenant, body.context.token);

  const workflowService = new Z.api.system.workflow.WorkflowService(client);
  const saleService = new Z.api.sale.SaleService(client);

  // Filter workpieceNodes parked for more than 48 hours
  var cutDate = new Date();
  cutDate.setDate(cutDate.getDate() - 2);

  let page = 0;
  let count = 0;

  while (true) {
    const sp = new URLSearchParams();
    sp.set("q", `workpiece.source=ilike=/sale/sale:%;status==ACTIVE;dateTimeStart<=${cutDate.toISOString()};workflowNode.tags!=no-backlog;workflowNode.type!=FAIL;workflowNode.type!=SUCCESS`);
    sp.set("first", 50 * page++);
    sp.set("max", "50");
    sp.set("order", "dateTimeStart");

    const workpieceNodeList = await workflowService.workpieceNodeRead(sp.toString());
    if (!workpieceNodeList.length)
      break;

    for (const workpieceNode of workpieceNodeList) {
      let sale = await saleService.saleReadById(workpieceNode.workpiece.source.split(":")[1]);

      if (["CANCELED", "FINISHED"].includes(sale.status))
        continue;

      if (!sale.workpiece.workflowNode)
        continue;

      if ((sale.workpiece.workflowNode.tags ?? "").includes("no-backlog"))
        continue;

      const hours = Math.floor((new Date() - new Date(workpieceNode.dateTimeStart)) / 3600000);

      const severity = hours >= 72 ? "urgente" : "atrasado";

      sale.tags = (sale.tags ?? "").split(",").concat(severity).filter(e => e).join(",");

      sale = saleService.saleOpUpdate(sale);

      console.info(`Pedido de venda ${sale.id} anotado com a tag "${severity}"`);

      //       const message = new Z.api.system.mail.Message();
      //       message.from = { description: sale.company.person.name };
      //       // message.to = [{ address: workpieceNode.user?.code ?? sale.company.person.email }];
      //       message.to = [{ address: "fabianobonin@gmail.com" }];
      //       message.subject = `${severity}: Pedido de venda ${sale.code ?? sale.id}, ${sale.person.fantasyName ?? sale.person.name}`;
      //       message.content =`
      // Este pedido está há mais de ${hours} horas no status "${sale.workpiece.workflowNode.description}".

      // http://${body.context.tenant}.zenerp.app.br/sale/sale.html?q=id==${sale.id}

      // Zen Erp ®`;
      //       message.mimeType = "text/plain;charset=utf-8";
      //       message.source = `/sale/sale:${sale.id}`;

      //       // adicionar tag no futuro, enviar e-mail no momento
      //       // sale.tags = (sale.tags ?? "").split(",");

      //       const mailService = new Z.api.system.mail.MailService(client);
      //       try {
      //         await mailService.messageOpSend(null, null, message);
      //       } catch (error) {
      //         console.error(error);
      //       }

      console.log(++count, page, sale.id);
    }
  }

  return null;
}