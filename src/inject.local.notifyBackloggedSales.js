import { watch } from "./watcher.js";

const zenRes = await watch({
  method: "POST",
  path: "/",
  query: {},
  headers: {
    "content-type": "application/json",
  },
  body: {
    context: {
      tenant: "company",
      event: "/custom/notifyBackloggedSales",
      token: "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI5ZmVlZWVhZC1iZTNlLTQwMDItYmJiNi1lNWU5ZTMxNzA4NDQiLCJzdWIiOiJzdXBwb3J0QHBlcnNvbmFsc29mdC5jb20uYnIiLCJuYmYiOjE3MDk4MDI3ODYsImlhdCI6MTcwOTgwMjc4NiwiZXhwIjoxNzA5ODg5MTg2LCJsb2NhbGUiOiJwdC1CUiIsInRpbWVab25lIjoiQW1lcmljYS9TYW9fUGF1bG8ifQ.oEQ4RPdGPwQMIinhZfq13f0iCzAQ8LDnjAjf9L3j17M",
    },
    args: {},
  },
});

// console.log(zenRes.body.args.bean.code);