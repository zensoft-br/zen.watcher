const response = await fetch("https://localhost:8090/path?p1=v1", {
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

console.log(response.status);