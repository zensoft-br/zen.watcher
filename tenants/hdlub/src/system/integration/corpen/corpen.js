import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function corpen(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const saleService = new Z.api.sale.SaleService(z);

  const sale = await saleService.saleReadById(1002);
  const saleItemList = await saleService.saleItemRead(`q=sale.id==${sale.id}&order=id`);

  for (const saleItem of saleItemList) {
    const json = {
      CORPEM_ERP_MERC: {
        CGCCLIWMS: "18475130000146",
        PRODUTOS: [
          {
            CODPROD: saleItem.productPacking.code,
            NOMEPROD: saleItem.productPacking.product.description,
            // IWS_ERP: "1",
            // 0 FIFO
            // 1 Lote fabr.
            // 2 Data fabr.
            // 3 Data venc.
            // 4 Nº série
            // 5 Paletes cheios
            TPOLRET: "1",
            // IAUTODTVEN: "0",
            // QTDDPZOVEN: "",
            // ILOTFAB: "0",
            // IDTFAB: "0",
            // IDTVEN: "0",
            // INSER: "0",
            // SEM_LOTE_CKO: "0",
            // SEM_DTVEN_CKO: "0",
            // CODFAB: "3",
            // NOMEFAB: "Fabricante 3",
            // CODGRU: "grt3",
            // NOMEGRU: "grupo teste3",
            // CODPROD_FORN
            NCM: saleItem.productPacking.product.properties?.fiscal_br_NCM,
            EMBALAGENS: [
              {
                CODUNID: saleItem.productPacking.product.unit.code,
                FATOR: String(saleItem.productPacking.units),
                CODBARRA: saleItem.productPacking.barcode,
                // PESOLIQ: saleItem.productPacking.netWeightKg,
                // PESOBRU: saleItem.productPacking.grossWeightKg,
                ALT: "2",
                LAR: "2",
                COMP: "2",
                VOL: "",
                // IEMB_ENT
                // ITEM_SAI
              },
            ],
          },
        ],
      },
    };
    console.log(JSON.stringify(json));
    const response = await fetch("http://webcorpem.no-ip.info:37560/scripts/mh.dll/wc", {
      method: "POST",
      headers: {
        TOKEN_CP: "9rf3l62stlrohg64id24pmbhcu2458cmyas4i2ryw1m6sjcp652",
      },
      body: JSON.stringify(json),
    });
    if (!response.ok)
      throw new Error(await response.text());
  }

  let seq = 0;
  const json = {
    CORPEM_ERP_DOC_SAI: {
      CGCCLIWMS: "18475130000146",
      CGCEMINF: "18475130000146",
      OBSPED: sale.properties?.comments,
      OBSROM: "",
      NUMPEDCLI: String(sale.id),
      // ORDER_ID: "189456123",
      // NUMPEDRCA: "",
      VLTOTPED: String(sale.totalValue),
      // COD_MARKETP: "B2W",
      // IETIQ_MK: "N",
      // ORDER_ID_MK: "",
      // ECT_TPSERV: "PAC",
      CGCDEST: sale.person.documentNumber.replaceAll(/\D/g, ""),
      IEDEST: sale.person.document2Number ?? "ISENTO",
      NOMEDEST: sale.person.name,
      CEPDEST: sale.person.zipcode,
      UFDEST: sale.person.city?.state?.code,
      // IBGEMUNDEST: "3550308",
      MUN_DEST: sale.person.city.name,
      BAIR_DEST: sale.person.district,
      LOGR_DEST: sale.person.street,
      NUM_DEST: sale.person.number,
      COMP_DEST: sale.person.complement,
      TP_FRETE: sale.freightType === "ISSUER" ? "C" : "F",
      // CODVENDEDOR: "RUDIMAR",
      // NOMEVENDEDOR: "Rudimar (e-Commerce)",
      // DTINCLUSAOERP: "26/03/2020",
      // DTLIBERACAOERP: "26/03/2020",
      // DTPREV_ENT_SITE: "",
      // EMAILRASTRO: "",
      // DDDRASTRO: "",
      // TELRASTRO: "",
      // NUMNF: "",
      // SERIENF: "",
      // DTEMINF: "",
      // VLTOTALNF: "",
      // CHAVENF: "",
      // CGC_TRP: "11111111000199",
      // UF_TRP: "ES",
      // CDBLQ_CLG: "10",
      // PRIORIDADE: "ALTA",
      // COD_CARGA: "XYZ3594",
      // COD_RASTREIO: "12999XYZ3594",
      // ROTA_TRANSP: "ROTA 00157",
      // ETQCLIFILESIZE: "",
      // ETQCLIZPLBASE64: "",
      ITENS: saleItemList.map(saleItem => {
        return {
          NUMSEQ: String(++seq),
          CODPROD: saleItem.productPacking.code,
          QTPROD: String(saleItem.quantity),
          // LOTFAB
          VLUNIT: String(saleItem.unitValue),
          // CDBLQ_PROD: "15",
          // IDPERSO
          // TXPERSO
        };
      }),
    },
  };
  console.log(JSON.stringify(json));
  const response = await fetch("http://webcorpem.no-ip.info:37560/scripts/mh.dll/wc", {
    method: "POST",
    headers: {
      TOKEN_CP: "9rf3l62stlrohg64id24pmbhcu2458cmyas4i2ryw1m6sjcp652",
    },
    body: JSON.stringify(json),
  });
  if (!response.ok)
    throw new Error(await response.text());
}