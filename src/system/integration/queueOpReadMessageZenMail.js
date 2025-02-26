import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";
import { emailSale } from "./emailSale.js";
import { emailNFe } from "./emailNFe.js";
import { emailReceivable } from "./emailReceivable.js";

export async function queueOpReadMessageZenMail(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const integrationService = new Z.api.system.integration.IntegrationService(z);

  // TODO
  const messageList = await integrationService.queueOpReadMessage("ZEN/MAIL", 100);

  for (const message of messageList) {
    console.log("");
    console.log(`message ${message.id}`);

    try {
      const content = JSON.parse(message.content);

      if (message.subject === "/financial/billing/instructionResponseOpProcess") {
        const instructionResponse = JSON.parse(content.content).bean;

        if (instructionResponse.type === "REGISTERED") {
          zenReq.body.args = {
            id: instructionResponse.id,
          };

          await emailReceivable(zenReq);
        }
      } else if (message.subject === "/fiscal/br/dfeNfeProcOutOpConfirm") {
        const dfeNfeProcOut = JSON.parse(content.content).bean;

        zenReq.body.args = {
          id: dfeNfeProcOut.id,
        };

        await emailNFe(zenReq);
      } else if (message.subject === "/sale/saleOpApprove") {
        const sale = JSON.parse(content.content).bean;

        zenReq.body.args = {
          id: sale.id,
        };

        await emailSale(zenReq);
      }

      await integrationService.messageDelete(message.id);
      console.log(`${new Date().toISOString()} integrationService.messageDelete(${message.id})`);
    } catch (error) {
      console.error(error);
    }
  }
}