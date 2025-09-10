import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function payableCreate(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const bean = zenReq.body.args.bean;

  const payableService = new Z.api.financial.FinancialService(z);
  const [payable] = await payableService.payableRead(`q=code==${bean.code};person.id==${bean.person.id}`);

  if (payable) {
    throw new Error(`Já existe uma conta a pagar para o fornecedor ${bean.person.name} com código ${bean.code}. (ID: ${payable.id})`);
  }
}

