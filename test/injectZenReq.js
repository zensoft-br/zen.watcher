import { watch } from "../src/watcher";

watch({
  method: "POST",
  path: "/sale/saleUpdate",
  query: {},
  headers: {
    "content-type": "application/json",
  },
  body: {
    context: {
      tentant: "teste",
      token: "...",
      tags: ["before"],
    },
    args: {
      bean: {
        id: 1001,
        company: {
          id: 1001,
          // ...demais propriedades
        },
        person: {
          id: 1001,
          // ...demais propriedades
        },
        code: "code",
        date: "2024-01-01",
        totalValue: 1000,
        // ...demais propriedades
      },
    },
  },
});