import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function incomingListCreate(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const materialService = new Z.api.material.MaterialService(z);

  const bean = zenReq.body.args.bean;

  if (!bean.properties?.lotId) {
    const lot = await materialService.lotCreate({});

    bean.properties = {
      ...bean.properties,
      lotId: lot.id,
    };

    return zenReq;
  }
}
