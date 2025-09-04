import * as Z from "@zensoftbr/zenerpclient";
import "dotenv/config";

export async function salespersonAccessControl(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, zenReq.body.context.token);

  const securityService = new Z.api.system.security.SecurityService(z);

  const session = await securityService.sessionOpGetCurrent();

  // Restrict access to data related to the salesperson
  if ((session.user.tags ?? "").split(",").includes("salesperson")) {
    if (zenReq.body.context.event === "/system/data/dataSourceOpRead") {
      return handleDataSourceOpRead(zenReq, z, session);
    }

    if (zenReq.body.args?.search) {
      return handleSearch(zenReq, z, session);
    }
  }
}

async function handleDataSourceOpRead(zenReq, z, session) {
  // Handle specific logic for dataSourceOpRead if needed

  const dataService = new Z.api.system.data.DataService(z);

  const args = zenReq.body.args;

  const [dataSourceParameter] = await dataService.dataSourceParameterRead(
    `q=dataSource.code==${args.args.code};name==SALESPERSON_IDS`);
  if (!dataSourceParameter) {
    return;
  }

  const salespersonId = session.user.properties?.personId ?? 0;

  args.args.parameters = {
    ...args.args.parameters,
    SALESPERSON_IDS: [salespersonId],
  };

  return {
    body: {
      args,
    },
  };
}

async function handleSearch(zenReq, z, session) {
  const salespersonId = session.user.properties?.personId ?? 0;

  const customConditions = [];
  if (zenReq.path.startsWith("/financial/")) {
    // If the request is for financial data, use invoice.personSalesperson.id
    customConditions.push({
      type: "simple",
      propertyName: "invoice.personSalesperson.id",
      op: "EQ",
      value: {
        "@type": "java.lang.Long",
        value: salespersonId,
      },
    });
  } else {
    // For other requests, use personSalesperson.id
    customConditions.push({
      type: "simple",
      propertyName: "personSalesperson.id",
      op: "EQ",
      value: {
        "@type": "java.lang.Long",
        value: salespersonId,
      },
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
