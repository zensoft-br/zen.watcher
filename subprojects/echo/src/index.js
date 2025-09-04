import { createLambdaHandler } from "../../../shared/src/AwsLambda.js";

export const schema = [
  {
    // events: ["/catalog/person/personCreate", "/catalog/person/personUpdate"],
    path: "*",
    // params: {
    //   "case": {
    //     type: "text",

    //     options: [],
    //   }
    // },
    // tags: [],
  },
];

export const watcher = async (zenReq) => {
  return {
    statusCode: 200,
    contentType: "application/json",
    body: {
      zenReq,
    },
  };
};

export const handler = createLambdaHandler({ watcher, schema });
