import { api } from "@zensoftbr/zenerpclient";
import * as Z from "@zensoftbr/zenerpclient";

async function test() {
  const args = {
    category_id: undefined,
    product_ids: undefined, // array of ids
    sale_id: undefined, //
    uf_destino: undefined, //
    frete: undefined, // CIF/FOB
    frete_redespacho: undefined, // CIF/FOB
    prazo_pagamento: undefined, // "30/60/90"
    simples_nacional: false, // boolean
  };

  const z = Z.createFromToken("parnassa", "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI3ZmQzZTc4ZC02ZjdkLTRlYzMtYmQxNi1kNDQ1NTQyZGU3Y2IiLCJzdWIiOiJzdXBwb3J0QHBlcnNvbmFsc29mdC5jb20uYnIiLCJuYmYiOjE3Njg4MjQ2MzAsImlhdCI6MTc2ODgyNDYzMCwiZXhwIjoxNzY4OTExMDMwLCJsb2NhbGUiOiJwdC1CUiIsInRpbWVab25lIjoiQW1lcmljYS9TYW9fUGF1bG8ifQ.gMrbnx-6tTzj3NocwTlGGzFMODS-vGOA_Tn1NCLk54U");

  const purchaseService = new api.supply.purchase.PurchaseService(z);

  const q = [];
  q.push("priceList.id==1002");
  if (args.category_id) {
    q.push(`product.category2.id==${args.category_id}`);
  }
  if (args.product_ids && args.product_ids.length) {
    q.push(`(${args.product_ids.map(id => `product.id==${id}`).join(",")})`);
  }

  const priceListItemList = await purchaseService.priceListItemRead(`q=${q.join(";")}`);

  const result = [];

  for (const priceListItem of priceListItemList) {
    const obj = {
      prop1: "prop1",
      prop2: priceListItem.product.code,
      items: [],
    };

    result.push(obj);

    for (let i = 0; i < 10; i++) {
      obj.items.push({
        comissao: 10 + i,
      });
    }
  }

  return result;
}

console.log(await test());