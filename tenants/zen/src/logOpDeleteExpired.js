import * as Z from "@zensoftbr/zenerpclient";
import "dotenv/config";

export async function logOpDeleteExpired(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  // const auditService = new Z.api.system.audit.AuditService(z);

  // auditService.logOpDeleteExpired();

  z.web.fetch("/system/audit/logOpDeleteExpired", {
    method: "POST",
  });

  // To prevent lambda closing before fetch
  await sleep(250);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}