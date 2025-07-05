export async function personCreate(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {},
  };

  if (zenReq.body?.context?.event === "/catalog/person/personCreate" && (zenReq.body?.context?.tags ?? []).includes("before")) {
    const person = zenReq.body.args.bean;

    const tags = (person.tags ?? "").split(",").filter(e => e);
    if (tags.includes("customer")) {
      tags.push("blocked");

      person.tags = tags.join(",");

      zenRes.body.args = {
        bean: person,
      };
    }
  }

  return zenRes;
}