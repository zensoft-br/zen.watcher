import * as Z from "@zensoftbr/zenerpclient";

// When a productPacking is created, if code is empty
// and variant is set, we will auto assign a code
export async function productCreateUpdate(zenReq) {
  const bean = zenReq.body.args.bean;

  try {
    if (!bean.category3) {
      bean.category3 = { id: 2263 };
    }

    bean.properties = bean.properties ?? {};

    /* TODO
    if (!bean.fiscalProfileProduct) {
      bean.fiscalProfileProduct = { id: 1252 };
      bean.properties.fiscal_br_NCM = "00000000"
    }*/

    /* campo alterado: ps_largura_pol */
    bean.properties.textileWidth = round((bean.properties.ps_largura_pol ?? 0) * 2.54 / 100, 2);
    bean.properties.textileYield = round(1000 / (bean.properties.textileWidth * bean.properties.textileGramWeight), 2);
    bean.properties.ps_largura_cm = round((bean.properties.textileWidth ?? 0) * 100, 2);
    bean.properties.ps_gramatura_ml = round((bean.properties.textileWidth ?? 0) * (bean.properties.textileGramWeight ?? 0), 4);

    /* campo alterado: ps_largura_util_pol */
    bean.properties.ps_largura_util_cm = round((bean.properties.ps_largura_util_pol ?? 0) * 2.54 / 100, 2);

    /* campos da amostra original */
    if (!bean.properties.ps_largura_y) {
      bean.properties.ps_largura_y = bean.properties.textileWidth;
    }

    if (!bean.properties.ps_gramatura_y) {
      bean.properties.ps_gramatura_y = bean.properties.textileGramWeight;
    }

    if (!bean.properties.textileGramWeight) {
      bean.properties.textileGramWeight = bean.properties.ps_gramatura_y;
    }

    if (bean.unit.code === "kg") {
      bean.netWeightKg = 1;
      bean.grossWeightKg = 1;
    } else {
      bean.netWeightKg = round(bean.properties.ps_gramatura_ml / 1000, 4);
      bean.grossWeightKg = bean.netWeightKg;
    }
  } catch (error) {
    console.error(error);
  }

  return {
    body: {
      args: zenReq.body.args,
    },
  };
}

function round(v, d) {
  return Math.round(v * (10 ** d)) / (10 ** d);
}