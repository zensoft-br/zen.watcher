export async function watch(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

  // When a productPacking is created, if code is empty
  // and variant is set, we will auto assign a code
  if (zenReq.body?.context?.event === "/catalog/product/productPackingCreate"
    && (zenReq.body?.context?.tags ?? []).includes("before")) {
    const bean = zenReq.body.args.bean;

    // Code is empty and variant is set
    if (!bean.code && bean.variant) {
      bean.code = `${bean.product.code }.${ bean.variant.code}`;

      // Will return zenRes.body.args just if code is changed
      zenRes.body.args = zenReq.body.args;
    }
  }

  return zenRes;
}
