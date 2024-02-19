import express from "express";
import { watch } from "./watcher";

const app = express();
const port = 8090;

app.use(express.json());

app.post("/", async (req, res, next) => {
  // if (req.body?.args?.bean)
  //   req.body.args.bean.code = "xxx";

  // const result = JSON.stringify({
  //   args: {
  //     ...req.body?.args,
  //   },
  // });

  const result = await watch(req.body ?? {});

  res.status(result.statusCode);
  res.contentType("application/json");
  res.send(result.body ?? {});
});

app.listen(port, () => {
  console.log(`zen.watcher running on port ${port}`);
});