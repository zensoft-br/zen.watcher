import * as Z from "@zensoftbr/zenerpclient";

export async function outgoingInvoiceOpApprove(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const financialService = new Z.api.financial.FinancialService(z);

  // Quando o cliente possuir contratos de descontos, concede o desconto automaticamente na aprovação da nota fiscal de saída
  const receivableList = await financialService.receivableRead(`q=outgoingInvoice.id==${zenReq.body.args.id}`);
  if (receivableList.length) {
    const contratoList = (receivableList[0].person.personGroup?.properties?.luxcar_contratos ?? [])
      .filter(e => e.tipo === "D");
    if (contratoList.length) {
      const settlements = [];
      for (const receivable of receivableList) {
        for (const contrato of contratoList) {
          settlements.push({
            billingTitleId: receivable.id,
            accountId: contrato.accountId ?? 1087,
            resultCenterId: contrato.resultCenterId,
            type: "DISCOUNT",
            value: Math.round((receivable.value * contrato.porcentagem / 100) * 100) / 100,
          });
        }
      }

      await financialService.receivableOpSettle({
        companyId: receivableList[0].company.id,
        settlements,
        methods: [],
      });
    }
  }
}
