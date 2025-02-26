import "dotenv/config";
import { watch } from "../../../src/watcher.js";

watch({
  method: "POST",
  path: "/zenmail",
  body: {
    context: {
      tenant: process.env.tenant,
    },
  },
});
