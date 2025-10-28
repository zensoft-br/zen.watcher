import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function saleOpLeadNotification(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const saleService = new Z.api.sale.SaleService(z);

  const date = new Date();
  // Subtract 7 days from date
  date.setDate(date.getDate() - 7);

  const saleList = await saleService.saleRead(`q=tags==lead;status==APPROVED;date<=${date.toISOString().split("T")[0]};person.tags==blocked`);

  const mailService = new Z.api.system.mail.MailService(z);

  if (saleList.length) {
    await mailService.messageOpSend(null, null, {
      to: [{ address:"kenichi@lucin.com.br" }],
      subject: "Pedidos APROVADOS com a tag 'lead', cliente com a tag 'blocked' e data anterior a 7 dias",
      body: `Existem ${saleList.length} pedidos com a tag 'lead' que foram aprovados e possuem data igual ou anterior a 7 dias, e cujo cliente está com a tag 'blocked'.\n\n
              Ids dos pedidos: ${saleList.map(sale => sale.id).join(", ")}`,
    });
  } else {
    await mailService.messageOpSend(null, null, {
      to: [{ address:"kenichi@lucin.com.br" }],
      subject: "Nenhum Pedido APROVADO com a tag 'lead', cliente com a tag 'blocked' e data anterior a 7 dias",
      body: "Nenhum pedido encontrado",
    });
  }
}