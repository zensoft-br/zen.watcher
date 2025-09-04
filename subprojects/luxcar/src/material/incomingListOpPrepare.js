import "dotenv/config";
import * as Z from "@zensoftbr/zenerpclient";

export async function incomingListOpPrepare(zenReq) {
  const z = Z.createFromToken(zenReq.body.context.tenant, process.env.token);

  const fiscalService = new Z.api.fiscal.FiscalService(z);
  const materialService = new Z.api.material.MaterialService(z);

  const incomingList = await materialService.incomingListReadById(zenReq.body.args.id);

  const [incomingInvoice] = await fiscalService.incomingInvoiceRead(`q=incomingList.id==${incomingList.id}`);

  if (incomingInvoice) {
    /*
     * Verifica se o romaneio de entrada possui inconsistências
     */
    if ((zenReq.body?.context?.tags ?? []).includes("before")) {
      const incomingListItemList = await materialService.incomingListItemRead(`q=incomingList.id==${incomingList.id}`);
      const mapIncomingList = incomingListItemList.reduce((red, e) => {
        red[e.productPacking.id] = (red[e.productPacking.id] ?? 0) + e.quantity;
        return red;
      }, {});

      const incomingInvoiceItemList = await fiscalService.incomingInvoiceItemRead(`q=incomingInvoice.id==${incomingInvoice.id}`);
      const mapIncomingInvoice = incomingInvoiceItemList.reduce((red, e) => {
        const productPacking = e.physicalProductPacking ?? e.productPacking;
        red[productPacking.id] = (red[productPacking.id] ?? 0) + (e.physicalQuantity ?? e.quantity);
        return red;
      }, {});

      const keys1 = Object.keys(mapIncomingList);
      const keys2 = Object.keys(mapIncomingInvoice);

      // Check if both objects have the same keys
      if (keys1.length !== keys2.length) {
        throw new Error("O romaneio de entrada contém inconsistências");
      }

      // Check if all keys and values are equal
      for (const key of keys1) {
        if (mapIncomingList[key] !== mapIncomingInvoice[key]) {
          throw new Error("O romaneio de entrada contém inconsistências");
        }
      }
    }

    /*
     * Aprova a nota fiscal de entrada automaticamente
     */
    if ((zenReq.body?.context?.tags ?? []).includes("after")) {
      if (incomingInvoice.status === "PREPARED") {
        await fiscalService.incomingInvoiceOpApprove(incomingInvoice.id);
      }
    }
  }
}