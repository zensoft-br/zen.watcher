/*
 * Move properties.comments to properties.company_comments
 */
export async function saleCreate(zenReq) {
  const bean = zenReq.body.args.bean;

  if (bean.properties.salesChannel === "SALESBREATH" && bean.properties.comments) {
    bean.properties.company_comments = bean.properties.comments;

    delete bean.properties.comments;

    return {
      body: {
        args: zenReq.body.args,
      },
    };
  }
}