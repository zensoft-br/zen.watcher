// When a productPacking is created, if code is empty
// and variant is set, we will auto assign a code
export async function productPackingCreate(zenReq) {
  if (zenReq.body?.context?.event !== "/catalog/product/productPackingCreate")
    return;

  if (!(zenReq.body?.context?.tags ?? []).includes("before"))
    return;

  const bean = zenReq.body.args.bean;

  // Code is empty and variant is set
  if (!bean.code && bean.variant) {
    bean.code = `${bean.product.code }.${bean.variant.code}`;

    // Will return zenRes.body.args just if code is changed
    return {
      body: {
        args: zenReq.body.args,
      },
    };
  }
}