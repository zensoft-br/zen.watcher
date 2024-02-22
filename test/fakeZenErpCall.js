const response = await fetch("https://watcher.zenerp.app.br/normalize?case=titleCase&props=name", {
  method: "POST",
  headers: {
    "content-type": "application/json",
  },
  body: JSON.stringify({
    context: {
      tentant: "teste",
      token: "token",
      tags: ["before"],
    },
    args: {
      bean: {
        name: "test",
      },
    },
  }),
});
console.log(await response.json());
