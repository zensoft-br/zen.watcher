import Z from "@zensoft-br/zenclient";

export async function notifyBackloggedSales(zenReq) {
  const body = zenReq.body;

  const client = Z.createFromToken(body.context.tenant, body.context.token);

  const workflowService = new Z.api.system.workflow.WorkflowService(client);
  const saleService = new Z.api.sale.SaleService(client);

  var cutDate = new Date();
  cutDate.setDate(cutDate.getDate() - 2);

  const sp = new URLSearchParams();
  sp.set("q", `workpiece.source=ilike=/sale/sale:%;status==ACTIVE;dateTimeStart<=${cutDate.toISOString()}`);
  sp.set("max", "50");

  const workpieceNodeList = await workflowService.workpieceNodeRead(sp.toString());
  for (const workpieceNode of workpieceNodeList) {
    const sale = await saleService.saleReadById(workpieceNode.workpiece.source.split(":")[1]);

    if (!["CANCELED", "FINISHED"].includes(sale.status))
      console.log(sale.id, sale.code);

    const message = new Z.api.system.mail.Message();
    message.from = { description: sale.company.person.name };
    // message.to = [{ address: workpieceNode.user.code }];
    message.to = [{ address: "fabianobonin@gmail.com" }];
    message.subject = `Pedido de venda ${sale.code ?? sale.id}, ${sale.person.fantasyName ?? sale.person.name}`;
    message.content =`
Este pedido está há mais de X horas no status "${sale.workpiece.workflowNode.description}".

http://${body.context.tenant}.zenerp.app.br/sale/sale.html?q=id==${sale.id}
`;
    message.mimeType = "text/plain; charset=utf-8";

    const mailService = new Z.api.system.mail.MailService(client);
    await mailService.messageOpSend(null, null, message);

    // adicionar tag no futuro, enviar e-mail no momento
    // sale.tags = (sale.tags ?? "").split(",");
  }

  return null;
}