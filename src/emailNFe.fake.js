import "dotenv/config";

import { watch } from "./watcher";

watch({
  method: "POST",
  path: "/email",
  query: {
    email: "user@domain.com",
    mailerConfig: "EMP1=MC1",
  },
  headers: {
    "content-type": "application/json",
  },
  body: JSON.stringify({
    context: {
      event: "/fiscal/br/dfeNfeProcOutOpConfirm",
      tenant: process.env.tenant,
      token: process.env.token,
      tags: ["after"],
    },
    args: {
      id: 3774,
    },
  }),
});
