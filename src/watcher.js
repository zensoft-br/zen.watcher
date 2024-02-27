// eslint-disable-next-line no-unused-vars
export async function watch(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

  /* When a productPacking is created, if no code is present and there is
    a variant, we will auto assign a code */
  if (zenReq.body?.context?.event === "/catalog/product/productPackingCreate"
    && (zenReq.body.context.tags ?? []).includes("before")) {
    const bean = zenReq.body.args.bean;
    if (!bean.code && bean.variant) {
      bean.code = `${bean.product.code }.${ bean.variant.code}`;
      zenRes.body.args = zenReq.body.args;
    }
  }

  return zenRes;
}
