import * as Z from "@zensoftbr/zenerpclient";

export async function instructionRequestOpCreateRegister(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.body?.context?.event === "/financial/receivableOpApprove" && (zenReq.body?.context?.tags ?? []).includes("after")) {
    // const zenClient = Z.createFromToken(zenReq.body.context.tenant, zenReq.body.context.token);
    const z = Z.createFromToken("http://localhost:8080/ZenErpWs", zenReq.body.context.token);

    const billingService = new Z.api.financial.billing.BillingService(z);

    // const instruction =
    await billingService.instructionRequestOpCreateRegister(zenReq.body.args.id, 1001);
  }

  return zenRes;
}