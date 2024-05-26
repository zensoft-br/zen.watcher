import * as Z from "@zensoftbr/zenerpclient";

export async function logOpDeleteExpired(zenReq) {
  if (zenReq.path === "/system/audit/logOpDeleteExpired") {
    const z = Z.createFromToken("http://localhost:8080/ZenErpWs", zenReq.body.context.token);

    const auditService = new Z.api.system.audit.AuditService(z);

    await auditService.logOpDeleteExpired();
  }

}