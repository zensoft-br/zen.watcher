import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";
import { sleep } from "../../../../shared/src/utils.js";

export async function databaseOpOptimize(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const systemService = new Z.api.system.SystemService(z);

  // Perform database optimization (do not wait for it to finish) 
  systemService.databaseOpOptimize();

  // Wait for a short period to ensure the operation is initiated
  await sleep(250);
}