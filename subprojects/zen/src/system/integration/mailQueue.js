import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";
import { mailReceivable } from "./financial/mailReceivable.js";
import { mailSale } from "./sale/mailSale.js";
import { mailDfeNfeProcOut } from "./fiscal/br/mailDfeNfeProcOut.js";

export async function mailQueue(event) {
  const z = Z.createFromToken(event.body.context.tenant, process.env.token);

  const integrationService = new Z.api.system.integration.IntegrationService(z);

  const messageList = await integrationService.queueOpReadMessage("ZEN/MAIL", {
    maxMessages: 50,
  });
  for (const message of messageList) {
    try {
      const content = JSON.parse(message.content);

      if (message.subject === "/financial/billing/instructionResponseOpProcess") {
        const _content = JSON.parse(content.content);

        const instructionResponse = _content.result;

        if ((instructionResponse.type === "REGISTERED" || instructionResponse.type === "CHANGED_DUE_DATE")
          && instructionResponse.billingTitle) {
          await mailReceivable(z, instructionResponse.billingTitle.id);
        }
      } else if (["/fiscal/br/dfeNfeProcOutOpConfirm", "/fiscal/br/dfeNfeProcOutOpTransmit"]
        .includes(message.subject)) {
        const _content = JSON.parse(content.content);
        const id = _content.args.id;

        await mailDfeNfeProcOut(z, id);
      } else if (message.subject === "/sale/saleOpApprove" || message.subject === "/sale/saleOpApproveUnconditionally") {
        const _content = JSON.parse(content.content);
        const id = _content.args.id;

        await mailSale(z, id);
      } else {
        return { statusCode: 400 };
      }

      // Delete message
      await integrationService.messageDelete(message.id);
      console.info(`Message ${message.id} deleted`);
    } catch (error) {
      // TODO registrar um log na mensagem
      console.error(error);
    }
  }
}