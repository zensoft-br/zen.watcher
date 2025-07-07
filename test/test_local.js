import { watcher } from "../subprojects/echo/dist/index.js";

const zenRes = await watcher({
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