import * as Z from "@zensoftbr/zenerpclient";
import { Message } from "@zensoftbr/zenerpclient/api/system/mail/Message";
import "dotenv/config";

/**
 * Quando um orçamento é preenchido, envia um e-mail para o vendedor com o orçamento em anexo.
 *
 * @param {*} zenReq
 */
export async function quoteOpFill(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const mailService = new Z.api.system.mail.MailService(z);
  const reportService = new Z.api.system.report.ReportService(z);
  const saleService = new Z.api.sale.SaleService(z);

  const bean = await saleService.quoteReadById(zenReq.body.args.id);
  if (bean.personSalesperson && bean.personSalesperson.email) {
    const result = await reportService.reportOpPrint({
      code: "/sale/report/quoteForm",
      format: "PDF",
      parameters: {
        ids: bean.id,
      },
    });

    var message = new Message();
    message.source = `/sale/quote:${bean.id}`;
    message.from = { description: bean.company.person.fantasyName ?? bean.company.person.name };
    message.to = [{ address: bean.personSalesperson.email }];
    message.bcc = [{ address: "novaes@squib.com.br" },
    { address: "rodrigo@squib.com.br" },
    { address: "castro@squib.com.br" }];
    message.subject = (await z.i18n).format("/sale/quote/identified", bean.person?.name ?? bean.properties?.personName);
    message.body = "Zen Erp ®";
    message.attachments = [{
      identifier: `${bean.code ?? bean.id}.pdf`,
      bytes: result.content,
      mimeType: result.contentType,
    }];
    await mailService.messageOpSend(null, null, message);
  }
}