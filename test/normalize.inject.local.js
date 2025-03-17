import "dotenv/config";

import { watch } from "../src/watcher.js";

const zenRes = await watch({
  method: "POST",
  path: "/normalize",
  query: {
    case: "upperCase",
    props: "prop1,prop2",
  },
  headers: {
    "content-type": "application/json",
  },
  body: {
    context: {
      event: "",
      tenant: process.env.tenant,
      token: process.env.token,
      tags: ["before"],
    },
    args: {
      bean1: {
        prop1: "value1",
        prop2: "value2",
        prop3: "value3",
      },
      bean2: {
        prop1: "value1",
        prop2: "value2",
        prop3: "value3",
      },
    },
  },
});

console.log(zenRes.body.args);
