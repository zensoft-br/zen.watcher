export async function purchaseCreate(zenReq) {
  const bean = zenReq.body.args.bean;

  if (!bean.properties?.paymentMethods && bean.person.properties?.paymentMethods) {
    bean.properties = {
      ...bean.properties,
      paymentMethods: bean.person.properties?.paymentMethods,
    };

    return zenReq;
  }
}