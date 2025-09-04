import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function notifyBackloggedSales(zenReq) {
  const body = zenReq.body;

  const client = Z.createFromToken(body.context.tenant, process.env.token);

  const workflowService = new Z.api.system.workflow.WorkflowService(client);
  const saleService = new Z.api.sale.SaleService(client);

  // Filter workpieceNodes parked for more than 48 hours
  var cutDate = new Date();
  cutDate.setDate(cutDate.getDate() - 2);

  let page = 0;

  while (true) {
    const sp = new URLSearchParams();
    sp.set("q", `workpiece.source=ilike=/sale/sale:%;status==ACTIVE;dateTimeStart<=${cutDate.toISOString()};workflowNode.tags!=no-backlog;workflowNode.type!=FAIL;workflowNode.type!=SUCCESS`);
    sp.set("first", 50 * page++);
    sp.set("max", "50");
    sp.set("order", "dateTimeStart");

    const workpieceNodeList = await workflowService.workpieceNodeRead(sp.toString());
    if (!workpieceNodeList.length) {
      break;
    }

    for (const workpieceNode of workpieceNodeList) {
      let sale = await saleService.saleReadById(workpieceNode.workpiece.source.split(":")[1]);
      if (!sale) {
        continue;
      }

      if (["CANCELED", "FINISHED"].includes(sale.status)) {
        continue;
      }

      if (!sale.workpiece?.workflowNode) {
        continue;
      }

      if ((sale.workpiece?.workflowNode.tags ?? "").includes("no-backlog")) {
        continue;
      }

      const hours = Math.floor((new Date() - new Date(workpieceNode.dateTimeStart)) / 3600000);

      const severity = hours >= 72 ? "urgente" : "atrasado";

      const tags = sale.tags ? sale.tags.split(",") : [];
      tags.push("atrasado");
      if (hours >= 72) {
        tags.push("urgente");
      }

      sale.tags = tags.join(",");

      sale = await saleService.saleOpUpdatePrepared(sale);

      console.log(`Pedido de venda ${sale.id}, tag "${severity} incluída"`);
    }
  }

  return null;
}