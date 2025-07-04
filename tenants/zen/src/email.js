import { emailNFe } from "./emailNFe.js";
import { emailReceivable } from "./emailReceivable.js";

export async function email(zenReq) {
  if (zenReq.query.help != null) {
    return {
      statusCode: 200,
      contentType: "text/plain",
      body: `/email
query params:
  mailerConfig
    empCode1=mailerConfigCode1,empCode2=mailerConfigCode2
`,
    };
  }

  // mailerConfig=EMP1=MC1,EMP2=MC2
  zenReq.mailerConfigMap = (zenReq.query.mailerConfig ?? "")
    .split(",")
    .filter(e => e)
    .reduce((red, e) => {
      const pair = e.split("=");
      red[pair[0]] = pair[1];
      return red;
    }, {});

  //
  if (zenReq.body?.context?.event === "/fiscal/br/dfeNfeProcOutOpConfirm") {
    return emailNFe(zenReq);
  }

  //
  if (zenReq.body?.context?.event === "/financial/billing/instructionResponseOpProcess") {
    return emailReceivable(zenReq);
  }
}