import * as Z from "@zensoftbr/zenerpclient";

export async function receivableOpApprove(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.body?.context?.event === "/financial/receivableOpApprove" && (zenReq.body?.context?.tags ?? []).includes("after")) {
    // const zenClient = Z.createFromToken(zenReq.body.context.tenant, zenReq.body.context.token);
    const zenClient = Z.createFromToken("http://localhost:8080/ZenErpWs", zenReq.body.context.token);

    const accountingService = new Z.api.financial.accounting.AccountingService(zenClient);
    const financialService = new Z.api.financial.FinancialService(zenClient);

    const receivable = await financialService.receivableReadById(zenReq.body.args.id);

    const discountPercent = receivable.person.properties?.discountPercent;
    const discountResultCenterId = receivable.person.properties?.discountResultCenterId;

    if (!discountPercent)
      return zenRes;

    const account = (await accountingService.accountRead("q=tags==@contratoAbatimento"))[0];
    if (account == null)
      throw new Error("Conta contábil @contratoAbatimento não encontrada");
    const resultCenter = (await accountingService.resultCenterRead(`q=id==${discountResultCenterId}`))[0];
    if (resultCenter == null)
      throw new Error("Centro de resultados @contratoAbatimento não encontrado");

    const value = Math.round(receivable.value * discountPercent / 100 * 100) / 100;

    const args = {
      companyId: receivable.company.id,
      settlements: [
        {
          billingTitleId: receivable.id,
          accountId: account.id,
          resultCenterId: resultCenter.id,
          type: "DISCOUNT",
          value,
        },
      ],
      methods: [],
    };

    await financialService.receivableOpSettle(args);
  }

  return zenRes;
}
