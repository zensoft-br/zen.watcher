const zenRes = {
  statusCode: 200,
  headers: {
    "content-type": "application/json",
  },
  body: {
    args: {
      // "id": 9999,
      // "bean": {
      //   "id": 9999,
      // },
    },
  },
};

export class ZenRes {
  statusCode;
  headers;
  body;
}