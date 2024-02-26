const zenReq = {
  method: "POST",
  path: "/",
  query: {
    // "p1": "v1",
    // "p2": "v2",
  },
  headers: {
    "content-type": "application/json",
  },
  body: {
    context: {
      tenant: "tenant",
      event: "/module/operation",
      token: "jwt",
      tags: ["after", "before"],
    },
    args: {
      // "id": 9999,
      // "bean": {
      //   "id": 9999,
      // },
    },
  },
};

export class ZenReq {
  method;
  path;
  query;
  headers;
  body;
}