await fetch("https://localhost:8090", {
  method: "POST",
  headers: {
    "content-type": "application/json",
  },
  body: JSON.stringify({
    context: {
      tenant: "teste",
      event: "/module/event",
      token: "token",
      tags: ["before"],
    },
    args: {
      id: 1001,
    },
  }),
});