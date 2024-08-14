// DO NOT CHANGE THIS FILE!

import "dotenv/config";
import express from "express";
import { watch } from "./src/watcher.js";

const app = express();
const port = 8090;

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.all("*", async (req, res, next) => {
  try {
    // Convert Express req to zenReq
    const zenReq = {
      method: req.method,
      path: req.path,
      query: req.query,
      headers: req.headers,
      body: req.body,
    };

    // Replace tenant (for debug)
    if (process.env.tenant && zenReq.body?.context?.tenant) {
      zenReq.body.context.tenant = process.env.tenant;
    }

    let result = await watch(zenReq);
    result = {
      ...result,
      statusCode: result?.statusCode ?? 200,
    };

    if (result.statusCode)
      res.status(result.statusCode);
    res.contentType(result.contentType ?? "application/json");
    res.send(result.body ?? {});
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  res.status(500)
    .contentType("application/json")
    .send({
      type: "error",
      message: err.message,
      stack: process.env.NODE_ENV === "producttion" ? {} : err.stack,
    });
});

app.listen(port, () => {
  console.log(`zen.watcher running on port ${port}`);
});