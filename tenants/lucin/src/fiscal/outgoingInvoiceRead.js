import { api } from "@zensoftbr/zenerpclient";
import * as Z from "@zensoftbr/zenerpclient";

export async function outgoingInvoiceRead(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, zenReq.body.context.token);

  const customConditions = [];

  const securityService = new api.system.security.SecurityService(z);

  // Block access for users who are not granted to "/custom/lucin/faturamento/restrito" accessPoint
  // RSQL: outgoingInvoice.invoiceSeries==null or outgoingInvoice.invoiceSeries.tags!=restrito
  if (!await securityService.accessPointOpValidate("/custom/lucin/faturamento/restrito")) {
    customConditions.push({
      type: "or",
      conditions: [
        {
          type: "null",
          propertyName: "invoiceSeries",
        },
        {
          type: "simple",
          propertyName: "invoiceSeries.tags",
          op: "NE",
          value: {
            "@type": "java.lang.String",
            value: "restrito",
          },
        },
      ],
    });
  }

  // If there are custom conditions, add them to the search argument
  if (customConditions.length) {
    const args = {
      ...zenReq.body.args,
    };

    // If there is already a search condition, add to the custom conditions
    if (args.search.condition) {
      customConditions.push(args.search.condition);
    }

    // Set the search condition to an "and" of all custom conditions
    args.search.condition = {
      type: "and",
      conditions: customConditions,
    };

    return {
      body: {
        args,
      },
    };
  }
}