import * as Z from "@zensoftbr/zenerpclient";
import "dotenv/config";

export async function incomingListItemCreate(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  // Antes de incluir, ajusta o lote
  if (zenReq.body?.context?.tags?.includes("before")) {
    const bean = zenReq.body.args.bean;

    const materialService = new Z.api.material.MaterialService(z);
    const productService = new Z.api.catalog.product.ProductService(z);

    const productPacking = await productService.productPackingReadById(bean.productPacking.id);

    if (!bean.lot && (productPacking.product.productProfile.tags ?? "").split(",").includes("stock.lot")) {
      const incomingListItemTemplate = (await materialService.incomingListItemRead(`q=incomingList.id==${bean.incomingList.id};productPacking.id==${bean.productPacking.id}`))[0];
      if (incomingListItemTemplate) {
        bean.lot = incomingListItemTemplate.lot;
      } else {
        const lot = await materialService.lotCreate({});
        bean.lot = lot;
      }

      return {
        body: {
          args: {
            bean,
          },
        },
      };
    }
  }

  // Após incluir, imprime a etiqueta de estoque
  if (zenReq.body?.context?.tags?.includes("after")) {
    const bean = zenReq.body.result;

    const reportService = new Z.api.system.report.ReportService(z);

    await reportService.reportOpPrint({
      code: "/material/report/stockLabel",
      parameters: {
        source: "incomingList",
        incomingListItemIds: bean.id,
      },
      printer: {
        code: "RECEBIMENTO",
      },
    });
  }
}
