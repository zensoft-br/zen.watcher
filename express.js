import "dotenv/config";
import express from "express";

const app = express();
const port = 8090;

const subproject = process.env.SUBPROJECT;
if (!subproject) {
  throw new Error("Set SUBPROJECT env var to select subproject");
}

let watcher;
let schema;

try {
  const mod = await import(`./subprojects/${subproject}/src/index.js`);
  watcher = mod.watcher;
  schema = mod.schema;

  if (typeof watcher !== "function") {
    throw new Error(`Client ${subproject} does not export 'watcher' function`);
  }
} catch (err) {
  console.error("Failed to load client module:", err);
  process.exit(1);
}

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.all("/schema", async (_, res, next) => {
  try {
    res.status(200).json(schema ?? {
      message: "No schema defined for this watcher.",
    });
  } catch (error) {
    next(error);
  }
});

app.all("*", async (req, res, next) => {
  try {
    const zenReq = {
      method: req.method,
      path: req.path,
      query: req.query,
      headers: req.headers,
      body: req.body,
    };

    if (process.env.tenant && zenReq.body?.context?.tenant) {
      zenReq.body.context.tenant = process.env.tenant;
    }

    let result = await watcher(zenReq);
    result = {
      ...result,
      statusCode: result?.statusCode ?? 200,
    };

    res.status(result.statusCode)
      .type(result.contentType ?? "application/json")
      .send(result.body ?? {});
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res) => {
  res.status(500).json({
    type: "error",
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? {} : err.stack,
  });
});

app.listen(port, () => {
  console.log(`zen.watcher running on port ${port}, client=${subproject}`);
});
