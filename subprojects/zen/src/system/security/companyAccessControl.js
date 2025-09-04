import * as Z from "@zensoftbr/zenerpclient";
import "dotenv/config";

export async function companyAccessControl(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, zenReq.body.context.token);

  const securityService = new Z.api.system.security.SecurityService(z);

  const session = await securityService.sessionOpGetCurrent();

  const companyIds =
    (session.user.properties?.companyIds ?? session.user.accessProfile?.properties?.companyIds ?? []);

  if (!companyIds.length) {
    return;
  }

  if (zenReq.body.context.event === "/system/data/dataSourceOpRead") {
    return handleDataSourceOpRead(zenReq, z, session);
  }

  if (zenReq.body.args?.search) {
    return handleSearch(zenReq, companyIds);
  }
}

async function handleDataSourceOpRead() {
  //
}

async function handleSearch(zenReq, companyIds) {
  const customConditions = [];

  customConditions.push({
    type: "or",
    conditions: companyIds.map(companyId => ({
      type: "simple",
      propertyName: "company.id",
      op: "EQ",
      value: {
        "@type": "java.lang.Long",
        value: companyId,
      },
    })),
  });

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
