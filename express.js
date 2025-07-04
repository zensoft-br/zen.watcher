import "dotenv/config";
import express from "express";

const app = express();
const port = 8090;

// Load tenant name from environment variable
const tenantName = process.env.TENANT_NAME;
if (!tenantName) {
  throw new Error("Set TENANT_NAME env var to select client subproject");
}

let watcher;

try {
  // Importa dinamicamente o watch do cliente escolhido
  watcher = (await import(`./tenants/${tenantName}/src/index.js`)).watcher;
  if (typeof watcher !== "function") {
    throw new Error(`Client ${tenantName} does not export 'watch' function`);
  }
} catch (err) {
  console.error("Failed to load client watch function:", err);
  process.exit(1);
}

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

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

    if (result.statusCode)
      res.status(result.statusCode);
    res.type(result.contentType ?? "application/json");
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
      stack: process.env.NODE_ENV === "production" ? {} : err.stack,
    });
});

app.listen(port, () => {
  console.log(`zen.watcher running on port ${port}, client=${tenantName}`);
});
