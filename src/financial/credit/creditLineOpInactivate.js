import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

/*
 * Inativa os clientes sem atividade há mais de 90 dias
 */
export async function creditLineOpInactivate(zenReq) {
  const zenRes = {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
    },
    body: {
      log: {
        person: [],
        personGroup: [],
      },
    },
  };

  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const dataService = new Z.api.system.data.DataService(z);
  const creditService = new Z.api.financial.credit.CreditService(z);

  // Load personActivity data and map to a simpler object with relevant data
  const dataSource = (await dataService.dataSourceOpRead({
    code: "/catalog/person/report/personActivity",
    parameters: {
      FLOW: -1,
    },
  }))
    .map((e) => ({
      person_id: e.person_id,
      personGroup_id: e.personGroup_id,
      inactivityDays: e.inactivityDays ?? 99999,
    }));

  const creditLineItemList = await creditService.creditLineItemRead("q=creditLine.id==1001;tags!=inactive");
  for (const creditLineItem of creditLineItemList) {
    if (creditLineItem.person) {
      const inactivityDays = dataSource
        .filter((e) => e.person_id === creditLineItem.person.id)
        .map((e) => e.inactivityDays)
        .reduce((red, e) => Math.min(red, e), 99999);
      if (inactivityDays > 90) {
        const tags = (creditLineItem.tags ?? "").split(",").filter((e) => e);
        tags.push("inactive");
        creditLineItem.tags = tags.join(",");
        await creditService.creditLineItemUpdate(creditLineItem);

        zenRes.body.log.person.push(`Inativado crédito de pessoa, ${creditLineItem.person.name}, ${creditLineItem.id}, R$ ${creditLineItem.value}`);
      }
    }

    if (creditLineItem.personGroup) {
      const inactivityDays = dataSource
        .filter((e) => e.personGroup_id === creditLineItem.personGroup.id)
        .map((e) => e.inactivityDays)
        .reduce((red, e) => Math.min(red, e), 99999);
      if (inactivityDays > 90) {
        const tags = (creditLineItem.tags ?? "").split(",").filter((e) => e);
        tags.push("inactive");
        creditLineItem.tags = tags.join(",");
        await creditService.creditLineItemUpdate(creditLineItem);

        zenRes.body.log.person.push(`Inativado crédito de grupo empresarial, ${creditLineItem.personGroup.description}, ${creditLineItem.id}, R$ ${creditLineItem.value}`);
      }
    }
  }

  return zenRes;
}
