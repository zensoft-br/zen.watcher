const z_req = {
  "method": "POST",
  "path": "/",
  "query": {
    // "p1": "v1",
    // "p2": "v2",
  },
  "headers": {
    "content-type": "application/json",
  },
  "body": {
    "context": {
      "tentant": "tenant",
      "event": "/module/operation",
      "token": "jwt",
    },
    "args": {
      // "id": 9999,
      // "bean": {
      //   "id": 9999,
      // },
    },
  },
};