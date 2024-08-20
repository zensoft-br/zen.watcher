import "dotenv/config";

export async function quoteItemProposalCreate(zenReq) {
  const bean = zenReq.body.args.bean;

  if (!bean.currency) {
    bean.currency = {
      id: 1004,
    };

    return {
      body: {
        args: {
          bean,
        },
      },
    };
  }
}