import { api } from "@zensoftbr/zenerpclient";
import * as Z from "@zensoftbr/zenerpclient";

function prazoMedio(str) {
  // Se já for número, converte direto
  if (typeof str === "number") {
    return str;
  }

  // Se for string isolada sem vírgula
  if (!str.includes(",")) {
    return Number(str);
  }

  // Caso seja lista separada por vírgula
  const numeros = str.split(",").map(Number);
  const soma = numeros.reduce((acc, val) => acc + val, 0);
  return soma / numeros.length;
}

function roundValue(valor, casasDecimais) {
  const fator = Math.pow(10, casasDecimais);
  return Math.round(valor * fator) / fator;
}

function createTaxationRuleProvider(z) {
  const taxationService = new api.fiscal.taxation.TaxationService(z);

  const cache = new Map();

  return async (fpCompany, fpPerson, fpProduct, fpOperation) => {
    const q = [];
    q.push("flow==OUT");
    q.push(`fiscalProfileCompany.description=="${encodeURIComponent(fpCompany)}"`);
    q.push(`fiscalProfilePerson.description=="${encodeURIComponent(fpPerson)}"`);
    q.push(`fiscalProfileProduct.description=="${encodeURIComponent(fpProduct)}"`);
    q.push(`fiscalProfileOperation.code=="${encodeURIComponent(fpOperation)}"`);

    const criteria = q.join(";");

    if (cache.has(criteria)) {
      return cache.get(criteria);
    }

    const [taxationRule] = await taxationService.taxationRuleRead(`q=${criteria}`);

    cache.set(criteria, taxationRule);

    return taxationRule;
  };
}

async function test() {
  const args = {
    category_id: undefined,
    product_ids: undefined, // array of ids
    sale_id: 1002, //
    uf_destino: undefined, //
    frete: undefined, // CIF/FOB
    frete_redespacho: undefined, // CIF/FOB
    prazo_pagamento: undefined, // "30/60/90"
    simples_nacional: false, // boolean
  };

  const z = Z.createFromToken("parnassa", "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI5ZGI4ZmMyMS01Nzg1LTQxYjgtOGJiOS1mYTAxNjIyYWQwODAiLCJzdWIiOiJzdXBwb3J0QHBlcnNvbmFsc29mdC5jb20uYnIiLCJuYmYiOjE3NjkwMTMyMDAsImlhdCI6MTc2OTAxMzIwMCwiZXhwIjoxNzY5MDk5NjAwLCJsb2NhbGUiOiJwdC1CUiIsInRpbWVab25lIjoiQW1lcmljYS9TYW9fUGF1bG8ifQ.lNe1zOCpkL3Cq2cZ6lsC8VJQmGpbQSnZJV5BcvRHdDc");

  const purchaseService = new api.supply.purchase.PurchaseService(z);
  const saleService = new api.sale.SaleService(z);
  const provider = createTaxationRuleProvider(z);

  const q = [];
  q.push("priceList.id==1002");
  // prepara o filtro para os produtos que estão na categoria de preços informada
  if (args.category_id) {
    q.push(`product.category2.id==${args.category_id}`);
  }
  // prepara o filtro para os produtos informados
  if (args.product_ids && args.product_ids.length) {
    q.push(`(${args.product_ids.map(id => `product.id==${id}`).join(",")})`);
  }
  // prepara o filtro para os produtos relacionados à venda informada
  if (args.sale_id) {
    const saleItemList = await saleService.saleItemRead(`q=sale.id==${args.sale_id}`);
    if (saleItemList && saleItemList.length) {
      const productIds = [
        ...new Set(
          saleItemList.map(item => item.productPacking.product.id)
        )
      ];
      if (productIds && productIds.length) {
        q.push(`(${productIds.map(id => `product.id==${id}`).join(",")})`);
      }
    }
  }

  // atribui os parametros das políticas comerciais
  const sale = args.sale_id ? await saleService.saleReadById(args.sale_id) : null;
  const paymentMethods = prazoMedio(sale?.properties?.paymentMethods ?? args.prazo_pagamento ?? 28);
  const freightType = (sale?.freightType ?? args.frete);
  const freightTypeTransshipment = (sale?.properties?.freightTypeTransshipment ?? args.frete_redespacho);
  const simplesNacional = (sale ? sale.person.fiscalProfilePerson?.description.includes("Simples Nacional") : args.simples_nacional ?? false);
  const ufDestino_tmp = (sale?.person?.city?.state?.code ?? args.uf_destino ?? "SP");
  const ufDestino = freightTypeTransshipment === "RECIPIENT" ? "SP" : ufDestino_tmp;
  
  // localiza os itens que atendem os filtros
  const priceListItemList = await purchaseService.priceListItemRead(`q=${q.join(";")}`);
  let dolar = priceListItemList?.properties?.dolar ?? 5.3;
  let comissao = 1;
  let lucro = 9;
  let ir = roundValue(lucro * 0.515151, 6);

  const result = [];

  for (const priceListItem of priceListItemList) {
    const category = priceListItem.product.category2.description;
    const valorFob = priceListItem.unitValue;
    const nacionalizacao = priceListItem.properties?.percentualNacionalizacao ?? 0;
    const taxationRule = await provider("Lucro Real SC", "Regime Normal SP", priceListItem.product.fiscalProfileProduct.description, "Venda");

    let comissao = 1;
    let pis_cofins = 0;
    let icms = 0;
    let frete = 0;
    let ipi = Number(taxationRule.properties?.["tax.IPI.taxRate"] ?? 0);

    // calculo das regras tributárias
    /* regras para decoracao e aviamentos e tecidos em SC Simples Nacional*/
    if (((category === "Aviamentos") || (category === "Tecidos") || (category === "Decoracoes")) && (ufDestino === "SC") && (simplesNacional)) 
    {
      pis_cofins = 9.25;
      icms = 6.5;
      frete = 3;
    }
    /* regras para fibras em SC Simples Nacional*/
    else if ((category === 20) && (ufDestino === "SC") && (simplesNacional)) 
    {
      pis_cofins = 9.25;
      icms = 6.5;
      frete = 6;
    }
    /* regras para calçadista em SC Simples Nacional*/
    else if ((category === 70) && (ufDestino === "SC") && (simplesNacional)) 
    {
      pis_cofins = 9.25;
      icms = 17;
      frete = 3;
    }
    /* regras para decoracao em DF, GO, MG, RJ */
    else if ((category === "Decoracoes") && (freightType === "ISSUER") && ((ufDestino === "DF") || (ufDestino === "GO") || (ufDestino === "MG") || (ufDestino === "RJ"))) 
    {
      pis_cofins = 9.25;
      icms = 1.4;
      frete = 6;
    }
    /* regras para decoracao em SC, SP, PR, RS */
    else if ((category === "Decoracoes") && (freightType === "ISSUER") && ((ufDestino === "SC") || (ufDestino === "SP") || (ufDestino === "PR") || (ufDestino === "RS"))) 
    {
      pis_cofins = 9.25;
      icms = 1.4;
      frete = 3;
    }
    /* regras para decoracao nos demais estados */
    else if ((category === "Decoracoes") && (freightType === "ISSUER")) 
    {
      pis_cofins = 9.25;
      icms = 1.4;
      frete = 7;
    }
    /* regras para fibras em DF, ES, GO, MG, MS, MT */
    else if ((category === 20) && (freightType === "ISSUER") && ((ufDestino === "DF") || (ufDestino === "ES") || (ufDestino === "GO") || (ufDestino === "MG") || (ufDestino === "MS")
      || (ufDestino === "MT"))) 
      {
      pis_cofins = 9.25;
      icms = 1.4;
      frete = 10;
    }
    /* regras para fibras em PR, SC, SP, RS */
    else if ((category === 20) && (freightType === "ISSUER") && ((ufDestino === "PR") || (ufDestino === "SC") || (ufDestino === "SP") || (ufDestino === "RS"))) 
    {
      pis_cofins = 9.25;
      icms = 1.4;
      frete = 6;
    }
    /* regras para fibras nos demais estados */
    else if ((category === 20) && (freightType === "ISSUER")) 
    {
      pis_cofins = 9.25;
      icms = 1.4;
      frete = 12;
    }
    /* regras para tecidos em DF, GO, RJ */
    else if ((category === "Tecidos") && (freightType === "ISSUER") && ((ufDestino === "DF") || (ufDestino === "GO") || (ufDestino === "RJ"))) 
    {
      pis_cofins = 9.25;
      icms = 1.4;
      frete = 6;
    }
    /* regras para tecidos em SC, SP, PR, RS */
    else if ((category === "Tecidos") && (freightType === "ISSUER") && ((ufDestino === "SC") || (ufDestino === "SP") || (ufDestino === "PR") || (ufDestino === "RS"))) 
    {
      pis_cofins = 9.25;
      icms = 1.4;
      frete = 3;
    }
    /* regras para tecidos nos demais estados */
    else if ((category === "Tecidos") && (freightType === "ISSUER")) 
    {
      pis_cofins = 9.25;
      icms = 1.4;
      frete = 8;
    }
    /* regras para aviamentos em SC, SP */
    else if ((category === "Aviamentos") && (freightType === "ISSUER") && ((ufDestino === "SC") || (ufDestino === "SP"))) 
    {
      pis_cofins = 9.25;
      icms = 1.4;
      frete = 3;
    }
    /* regras para aviamentos em RS */
    else if ((category === "Aviamentos") && (freightType === "ISSUER") && (ufDestino === "RS")) 
    {
      pis_cofins = 9.25;
      icms = 1.4;
      frete = 6;
    }
    /* regras para aviamentos nos demais estados */
    else if ((category === "Aviamentos") && (freightType === "ISSUER")) 
    {
      pis_cofins = 9.25;
      icms = 1.4;
      frete = 10;
    }
    /* regras gerais para aviamentos, decorações e tecidos */
    else if ((category === "Aviamentos") || (category === "Tecidos") || (category === "Decoracoes")) 
    {
      pis_cofins = 9.25;
      icms = 1.4;
      frete = 3;
    }
    /* regras gerais para fibras */
    else if (category === 20) 
    {
      pis_cofins = 9.25;
      icms = 1.4;
      frete = 6;
    }
    /* regras gerais para calçadista */
    else if (category === 70) 
    {
      pis_cofins = 9.25;
      icms = 1.4;
      frete = 6;
    }
    
    const obj = {
      category,
      product: priceListItem.product.code,
      valorFob,
      nacionalizacao,
      dolar,
      paymentMethods,
      pis_cofins,
      icms,
      frete,
      ipi,
      items: [],
    };
    for (let i = 0; i < 10; i++) {
      // cálculo dos preços e comissões
      let id = i + 1;

      if (i > 0) {
        if (id === 10) 
          comissao = comissao + 1;
        else
          comissao = comissao + 0.5;

        if ((id === 6) || (id > 8)) 
          lucro = lucro + 1;
        else
          lucro = lucro + 0.5;

        ir = roundValue(lucro * 0.515151, 6);
      }

      const baseCalculoBruta = roundValue(((pis_cofins + icms + frete + comissao + lucro + ir) / 100), 4);
      const ipiTaxation = roundValue((ipi / 100), 4);
      const baseCalculoLiquida = roundValue(nacionalizacao / (baseCalculoBruta - 1) * (1 + ipiTaxation), 4);

      let valorDolar = roundValue(valorFob * (baseCalculoLiquida * -1), 4);
      let valor = roundValue(valorDolar * dolar, 4);

      /* prazo a vista tem 4% de desconto */
      if (paymentMethods <= 21) 
        valor = roundValue(valor * 0.96, 4);      

      const item = {
        id,
        descricao: "Preço " + String(i + 1).padStart(2, "0"),
        comissao,
        valorDolar,
        valor,
        lucro,
        ir,
      }
      obj.items.push(item);
    }
    result.push(obj);
  }
  return result;
}

await test();