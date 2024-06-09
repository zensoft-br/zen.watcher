import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function databaseOpOptimize(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  // Aguardar atualização 1.0.7 do zenerpclient
  // const systemService = new Z.api.system.SystemService(z);
  // await systemService.databaseOpOptimize();

  // Will not wait
  z.web.fetch("/system/databaseOpOptimize", {
    method: "POST",
  });

  // To prevent lambda closing before fetch
  await sleep(250);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}