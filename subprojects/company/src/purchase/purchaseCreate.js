import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function purchaseCreate(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const bean = zenReq.body.args.bean;
  const tags = (bean.tags ?? "").split(",").filter((e) => e);

  if (!(tags ?? []).includes("#partial")) {
    const purchaseService = new Z.api.supply.purchase.PurchaseService(z);
    const [purchase] = await purchaseService.purchaseRead(`q=code==${bean.code};person.id==${bean.person.id}`);

    if (purchase) {
      throw new Error(`Já existe um pedido de compra para o fornecedor ${bean.person.name} com código ${bean.code}. (ID: ${purchase.id})`);
    }
  }
}

