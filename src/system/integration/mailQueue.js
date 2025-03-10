import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";
import { emailReceivable } from "./financial/mailReceivable.js";
import { mailSale } from "./sale/mailSale.js";

export async function mailQueue(event) {
  const z = Z.createFromToken(event.body.context.tenant, process.env.token);

  const integrationService = new Z.api.system.integration.IntegrationService(z);

  const messageList = await integrationService.queueOpReadMessage("ZEN/MAIL", 100);
  for (const message of messageList) {
    try {
      const content = JSON.parse(message.content);

      if (message.subject === "/financial/billing/instructionResponseOpProcess") {
        const _content = JSON.parse(content.content);

        const instructionResponse = _content.result;

        if (instructionResponse.type === "REGISTERED") {
          const id = _content.args.id;

          await emailReceivable(event);
        }
      } else if (message.subject === "/fiscal/br/dfeNfeProcOutOpConfirm") {
        const _content = JSON.parse(content.content);
        const id = _content.args.id;

        await emailNFe(Z, id);
      } else if (message.subject === "/sale/saleOpApprove" || message.subject === "/sale/saleOpApproveUnconditionally") {
        const _content = JSON.parse(content.content);
        const id = _content.args.id;

        await mailSale(z, id);
      } else {
        return { statusCode: 400 };
      }

      // Delete message
      await integrationService.messageDelete(message.id);
    } catch (error) {
      console.error(error);
    }
  }
}

// await mailQueue({
//   body: {
//     context: {
//       tenant: "teste",
//     },
//   },
// });