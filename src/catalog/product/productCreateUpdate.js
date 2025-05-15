import * as Z from "@zensoftbr/zenerpclient";

// When a productPacking is created, if code is empty
// and variant is set, we will auto assign a code
export async function productCreateUpdate(zenReq) {
  const bean = zenReq.body.args.bean;

  try {
    bean.properties = bean.properties ?? {};

    bean.properties.ps_largura_cm = round((bean.properties.textileWidth ?? 0) * 100, 4);
    bean.properties.ps_gramatura_ml = round((bean.properties.textileWidth ?? 0) * (bean.properties.textileGramWeight ?? 0), 4);
    bean.properties.ps_largura_pol = round((bean.properties.textileWidth ?? 0) / 2.54 * 100, 4);

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