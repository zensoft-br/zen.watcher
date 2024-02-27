import "dotenv/config";

import { watch } from "./watcher.js";

watch({
  method: "POST",
  path: "/email",
  query: {
    email: "teste@zensoft.com.br",
    mailerConfig: "ACT=ACT/NFE,MP=MP/NFE",
  },
  headers: {
    "content-type": "application/json",
  },
  body: {
    context: {
      event: "/fiscal/br/dfeNfeProcOutOpConfirm",
      tenant: process.env.tenant,
      token: process.env.token,
      tags: ["after"],
    },
    args: {
      id: 3838,
    },
  },
});
