import { saleOpCreate } from "./sale/saleOpCreate.js";

// eslint-disable-next-line no-unused-vars
export async function watch(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.body.context.event === "/sale/saleOpCreate") {
    return await saleOpCreate(zenReq);
  }

  return zenRes;
}
