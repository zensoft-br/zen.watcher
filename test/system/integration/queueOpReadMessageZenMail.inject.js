import "dotenv/config";
import { watch } from "../../../src/watcher.js";

watch({
  method: "POST",
  path: "/mail/queue",
  body: {
    context: {
      tenant: process.env.tenant,
    },
  },
  requestContext: {
    http: {
      method: "POST",
      path: "/mail/queue",
    },
  },
});
