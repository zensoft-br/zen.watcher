import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function print(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  if (!zenReq.query.report)
    throw new Error("Missing query.report");
  if (!zenReq.query.dataSource)
    throw new Error("Missing query.dataSource");
  if (!zenReq.query.printer)
    throw new Error("Missing query.printer");
  if (!zenReq.body.args.id)
    throw new Error("Missing args.id");

  const reportService = new Z.api.system.report.ReportService(z);

  await reportService.reportOpGenerate({
    code: zenReq.query.report,
    format: "PDF",
    dataSource: {
      code: zenReq.query.dataSource,
      parameters: {
        IDS: `{${zenReq.body.args.id}}`,
      },
    },
    printer: {
      code: zenReq.query.printer,
    },
  });
}