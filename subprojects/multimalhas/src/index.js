import { createLambdaHandler } from "../../../shared/src/AwsLambda.js";
import { saleOpApprove } from "./sale/saleOpApprove.js";

export const schema = {
  version: "1.0",
  watchers: [
    {
      description: "Quando um pedido de venda é aprovado, os itens do pedido são alimentados no estoque",
      path: "/",
      events: ["/sale/saleOpApprove"],
      tags: ["after"],
    },
  ],
};

export async function watcher(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.body?.context?.event === "/sale/saleOpApprove" && zenReq.body?.context?.tags?.includes("after")) {
    return await saleOpApprove(zenReq);
  }

  return zenRes;
}

export const handler = createLambdaHandler({ watcher, schema });
