import { watch } from "../src/watcher";

const zenRes = await watch({
  method: "POST",
  path: "/path",
  query: {
    p1: "v1",
  },
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

console.log(zenRes.statusCode);