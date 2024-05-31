import * as Z from "@zensoftbr/zenerpclient";

// Associa um novo lote na inclusão de romaneios de entrada com a tag #system
export async function incomingList_createLot(zenReq) {
  const incomingList = zenReq.body.args.bean;

  const tags = (incomingList.tags ?? "").split(",").filter(e => e);

  if (tags.includes("#system")) {
    const z = Z.createFromToken(zenReq.body.context.tenant, zenReq.body.context.token);
    const materialService = new Z.api.material.MaterialService(z);

    const lot = await materialService.lotCreate({});

    incomingList.properties = {
      ...incomingList.properties,
      lotId: lot.id,
    };

    return { statusCode: 200,
      body: {
        args: {
          bean: incomingList,
        },
      },
    };
  }
}