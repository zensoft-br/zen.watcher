import * as Z from "@zensoftbr/zenerpclient";

// Cria um código no formato yymmdd.sss na inclusão de lotes sem código
export async function lotCreate_setCodeSequence(zenReq) {
  const lot = zenReq.body.args.bean;

  if (lot.code) {
    return;
  }

  const datePart = new Date().toISOString().substring(2, 10).replace(/-/g, "");

  const z = Z.createFromToken(zenReq.body.context.tenant, zenReq.body.context.token);

  const materialService = new Z.api.material.MaterialService(z);

  const lastLot = (await materialService.lotRead(`q=code=like="${datePart}.%"&order=-code&max=1`))[0];

  const lastSeq = lastLot ? Number(lastLot.code.substring(7)) : 0;

  lot.code = `${datePart}.${String(lastSeq + 1).padStart(3, "0")}`;

  const zenRes = {
    statusCode: 200,
    body: {
      args: {
        bean: lot,
      },
    },
  };

  return zenRes;
}