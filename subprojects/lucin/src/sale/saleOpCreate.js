import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function saleOpCreate(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {
    },
  };

  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const personService = new Z.api.catalog.person.PersonService(z);
  const purchaseService = new Z.api.supply.purchase.PurchaseService(z);

  const args = zenReq.body.args.args;

  // Quando houver uma programação, altera o status do pedido de venda de acordo com o status do pedido de compra
  // Obtém a primeira programação disponível
  const purchaseItem = args.items.filter(e => e.schedule)[0]?.schedule;
  if (purchaseItem) {
    const purchase = (await purchaseService.purchaseItemReadById(purchaseItem.id))?.purchase;
    if (!purchase) {
      return;
    }
    // BOOK
    if (purchase.purchaseProfile.id === 1002) {
      // PRE_VENDA
      args.sale.saleProfile = {
        id: 1002,
      };
    }
    // PROGRAMACAO_PO
    else if (purchase.purchaseProfile.id === 1003) {
      // PROGRAMACAO_PO
      args.sale.saleProfile = {
        id: 1003,
      };
    }
    // EXCLUSIVO
    else if (purchase.purchaseProfile.id === 1004) {
      // EXCLUSIVO
      args.sale.saleProfile = {
        id: 1005,
      };
    }
    // PROGRAMACAO
    else if (purchase.purchaseProfile.id === 1005) {
      // PROGRAMACAO
      args.sale.saleProfile = {
        id: 1004,
      };
    }
  }

  // Adiciona a prioridade nas observações e verifica se o prazo do pedido está diferente do prazo do cliente
  {
    const person = await personService.personReadById(args.sale.person.id);
    if (person.category2) {
      const priority = `Prioridade: ${person.category2.code}`;

      let comments = args.sale.properties?.comments ?? "";
      comments = `${priority}\n${comments}`;
      args.sale.properties = {
        ...args.sale.properties,
        comments,
      };

      args.sale.tags = (args.sale.tags ?? "")
        .split(",")
        .filter(e => e)
        .concat(`prioridade${person.category2.code}`)
        .join(",");
    }

    if (person.properties?.paymentMethods !== args.sale.properties?.paymentMethods) {
      const paymentMethods = `Prazo cadastrado no cliente: ${person.properties?.paymentMethods}`;
      let comments = args.sale.properties?.comments ?? "";
      comments = `${paymentMethods}\n${comments}`;
      args.sale.properties = {
        ...args.sale.properties,
        comments,
      };

      args.sale.tags = (args.sale.tags ?? "")
        .split(",")
        .filter(e => e)
        .concat("PZ")
        .join(",");
    }
  }

  // Verifica se o pedido possui a tag "lead" e, se possuir, verifica se o cliente possui limite de crédito suficiente. Caso não possua, adiciona a tag "22" ao pedido.
  {
    if ((args.sale?.tags ?? []).includes("lead")) {
      const dataService = new Z.api.system.data.DataService(z);
      const dataSale = await dataService.dataSourceOpRead({
        code: "/sale/report/saleCube",
        parameters: { 
          PERSON_IDS: `{${args.sale.person.id}}`, 
          STATUS_LIST: "{\"PREPARING\", \"PREPARED\", \"APPROVED\", \"PICKING\"}"
        },
      });
      const saleTotalValue = dataSale.reduce((acc, curr) => acc + (curr.sum_totalValue ?? 0), 0) + (args.sale.totalValue ?? 0);

      const dataCreditLine = await dataService.dataSourceOpRead({
        code: "/financial/credit/dataSource/creditLineStats",
        parameters: { 
          CREDIT_LINE_ID: 1003,
          PERSON_IDS: `{${args.sale.person.id}}`
        },
      });
      const creditLineValue = dataCreditLine.reduce((acc, curr) => acc + (curr.person_credit_balance ?? 0), 0);

      if (saleTotalValue > creditLineValue) {
        args.sale.tags = (args.sale.tags ?? "")
        .split(",")
        .filter(e => e)
        .concat("22")
        .join(",");
      }
    }
  }

  zenRes.body.args = zenReq.body.args;

  return zenRes;
}
