import { watch } from "../src/watcher";

watch({
  method: "POST",
  path: "/",
  query: {},
  body: {
    context: {
      tenant: "teste",
      event: "/module/event",
      token: "token",
      tags: ["before"],
    },
    args: {
      id: 1001,
    },
  },
});