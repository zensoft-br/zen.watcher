import * as Z from "@zensoftbr/zenerpclient";

export async function pickingOrderOpReservationFinish(zenReq) {
  if (zenReq.body?.context?.event === "/material/pickingOrderOpReservationFinish" && (zenReq.body?.context?.tags ?? []).includes("after")) {
    const z = Z.createFromToken(zenReq.body.context.tenant, zenReq.body.context.token);

    const reportService = new Z.api.system.report.ReportService(z);

    const id = zenReq.body.args.id;

    await reportService.reportOpGenerate({
      code: "/material/report/pickingOrderForm",
      format: "PDF",
      parameters: {
        id,
      },
      // datasource: {
      //   code: "/material/report/pickingOrder",
      //   parameters: {
      //     id: 1001, // TODO voltar para id
      //   },
      // },
      printer: {
        code: "PRINTER-01",
        description: `Impresso da ordem de separação ${id}`,
      },
    });
  }
}