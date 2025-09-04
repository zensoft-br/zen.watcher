import * as Z from "@zensoftbr/zenerpclient";
import "dotenv/config";
import { sleep } from "../../../../../shared/src/utils.js";

export async function logOpDeleteExpired(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const auditService = new Z.api.system.audit.AuditService(z);

  // Perform log operation to delete expired entries (do not wait for it to finish)
  auditService.logOpDeleteExpired();

  // Wait for a short period to ensure the operation is initiated
  await sleep(250);
}