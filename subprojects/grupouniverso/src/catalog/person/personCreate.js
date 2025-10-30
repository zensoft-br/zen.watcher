import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

// When a person is created, the default sales price list is automatically assigned to them if no price list has been specified.
export async function personCreate(zenReq) {
  const bean = zenReq.body.args.bean;
  const tags = (bean.tags ?? "").split(",").filter((e) => e);

  // priceListRetail is null or undefined
  if ((tags ?? []).includes("customer") && (!bean.priceListRetail)) {
    const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);
    const saleService = new Z.api.sale.SaleService(z);
    const [priceList] = await saleService.priceListRead("q=tags==@default");

    if (priceList) {
      bean.priceListRetail = priceList;

      // Will return zenRes.body.args just if code is changed
      return {
        body: {
          args: zenReq.body.args,
        },
      };
    };    
  }
}