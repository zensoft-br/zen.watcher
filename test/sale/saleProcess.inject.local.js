import "dotenv/config";
import { watch } from "../../src/watcher.js";

watch({
  method: "POST",
  path: "/sale/process",
  // query: {
  //   email: process.env.to ?? "test@zensoft.com.br",
  //   // mailerConfig: "ACT=ACT/NFE,MP=MP/NFE",
  // },
  // headers: {
  //   "content-type": "application/json",
  // },
  body: {
    context: {
      event: "/sale/saleOpProcess",
      tenant: process.env.tenant,
      token: process.env.token,
      tags: ["after"],
    },
    args: {
      id: 56179,
    },
  },
});
