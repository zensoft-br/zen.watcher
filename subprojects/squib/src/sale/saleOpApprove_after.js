import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function saleOpApprove_after(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const reportService = new Z.api.system.report.ReportService(z);

  const id = zenReq.body.args.id;

  await reportService.reportOpPrint({
    code: "/sale/report/saleForm",
    format: "PDF",
    parameters: {
      ids: [id],
    },
    printer: {
      code: "PRINTER-01",
    },
  });
}