import * as Z from "@zensoftbr/zenerpclient";

export async function databaseOpOptimize(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, zenReq.body.context.token);

  // Aguardar atualização 1.0.7 do zenerpclient
  // const systemService = new Z.api.system.SystemService(z);
  // await systemService.databaseOpOptimize();

  await z.web.fetchOk("/system/databaseOpOptimize", {
    method: "POST",
  });
}