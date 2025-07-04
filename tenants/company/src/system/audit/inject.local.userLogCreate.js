import { watch } from "../../watcher.js";

const zenRes = await watch({
  method: "POST",
  path: "/",
  query: {},
  headers: {
    "content-type": "application/json",
  },
  body: {
    context: {
      tenant: "teste",
      event: "/system/audit/userLogCreate",
      token: "token",
      tags: ["before"],
    },
    args: {
      bean: {
        product: {
          code: "IMP011",
          grossWeightKg: 0,
          description: "BENGALINE TINTO 70%",
          heightCm: 0,
          type: "PRODUCT",
          volumeM3: 0,
          tags: "70%viscose,stock.lot,stock.serial,stock.serial.auto",
          fiscalProfileProduct: {
            fiscalRegion: {
              code: "BR",
              id: 1001,
              tags: "#system",
            },
            description: "55162200.1",
            id: 1005,
            properties: {
              "#user": "suporte@acquatextil.com",
              "#userId": "1002",
              "#created": "2023-08-30T10:40:49.374368908-03:00[America/Sao_Paulo]",
              fiscal_br_orig: "1",
            },
          },
          unit: {
            code: "m",
            conversionFactor: 1,
            description: "m",
            id: 1004,
            dimension: {
              code: "length",
              description: "@@:/catalog/unit/dimension/code/length",
              id: 1002,
              standardUnit: "m",
              tags: "#system",
            },
            tags: "#system",
          },
          netWeightKg: 0,
          widthCm: 0,
          id: 1009,
          lengthCm: 0,
          properties: {
            "#user": "suporte@acquatextil.com",
            "#userId": "1002",
            "#created": "2023-08-30T12:54:03.301917169-03:00[America/Sao_Paulo]",
            textileWidth: "1,50 M",
            fiscal_br_NCM: "55162200",
            textileCare01: "textile-care-071.png",
            textileCare02: "textile-care-088.png",
            textileCare03: "textile-care-011.png",
            textileCare04: "textile-care-001.png",
            textileCare05: "textile-care-033.png",
            textileCare06: "textile-care-098.png",
            textileCountry: "CHINA",
            fullDescription: "Bengaline pd. TECIDO PLANO, CONTENDO EM PESO 70% DE FIBRAS ARTIFICIAL\nDESCONTINUA DE VISCOSE COMBINADAS EM 25% DE FILAMENTOS SINTETICOS\nDE POLIAMIDA E 5% FILAMENTOS SINTETICOS DE ELASTANO, NÇO\nTEXTURIZADA, TINTO, LIGAMENTO SARJA, GRAMATURA APROX. DE 220-230\nG/M2, 1,44- 1,48 METROS DE LARGURA E TITULOS APROXIMADOS DE 72 E\n100 DTEX",
            textileGramWeight: "220 G/M2",
            textileComposition: "70%VISCOSE 25%POLIAMIDA 5%ELASTANO",
            textileAverageQuantity: "55 M",
          },
        },
        units: 1,
        variant: {
          code: "0001",
          description: "BRANCO",
          id: 1001,
          properties: {
            rgb: "#FFFFFF",
            "#user": "support@personalsoft.com.br",
            "#userId": "1",
            "#created": "2023-08-30T09:22:24.194891282-03:00[America/Sao_Paulo]",
          },
        },
        id: 1614,
        properties: {
          "#user": "suporte@acquatextil.com",
          "#userId": "1002",
          "#created": "2023-12-28T15:27:56.241762291-03:00[America/Sao_Paulo]",
        },
      },
    },
  },
});

console.log(zenRes.body.args.bean.code);