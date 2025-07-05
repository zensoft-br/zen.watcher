import "dotenv/config.js";
import { watch } from "../src/index.js";

await watch({
  method: "POST",
  path: "/",
  query: {},
  headers: {
    "content-type": "application/json",
  },
  body: {
    context: {
      tenant: process.env.tenant,
      event: "/custom/notifyBackloggedSales",
      token: process.env.token,
    },
    args: {},
  },
});

// console.log(zenRes.body.args.bean.code);