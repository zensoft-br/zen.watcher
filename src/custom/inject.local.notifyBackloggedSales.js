import { watch } from "../watcher.js";

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
      token: "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJiZGI1ZjFlYy0yNjllLTQ1MTItODgwNy1kYzIwZmI3ZjFhMzciLCJzdWIiOiJzdXBwb3J0QHBlcnNvbmFsc29mdC5jb20uYnIiLCJuYmYiOjE3MDk5MDQ1NDUsImlhdCI6MTcwOTkwNDU0NSwiZXhwIjoxNzA5OTkwOTQ1LCJsb2NhbGUiOiJwdC1CUiIsInRpbWVab25lIjoiQW1lcmljYS9TYW9fUGF1bG8ifQ.MSqd5oEyxxrTVj-TfOr79xa1ZRis3BJeJ7GKtLT_7p4",
    },
    args: {},
  },
});

// console.log(zenRes.body.args.bean.code);