import * as Z from "@zensoftbr/zenerpclient";

export async function logOpDeleteExpired(zenReq) {
  if (zenReq.path === "/system/audit/logOpDeleteExpired") {
    const z = Z.createFromToken(zenReq.body.context.tenant, zenReq.body.context.token);

    const auditService = new Z.api.system.audit.AuditService(z);

    const count = await auditService.logOpDeleteExpired();

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: {
        result: {
          count,
        },
      },
    };
  }
}