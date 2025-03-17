import "dotenv/config";

const response = await fetch("https://553qczrvwvd2kkxck22yuznv3a0lcbmm.lambda-url.sa-east-1.on.aws/email?email=fabianobonin@gmail.com&recipients=company", {
  method: "POST",
  headers: {
    "content-type": "application/json",
  },
  body: JSON.stringify({
    context: {
      event: "/financial/billing/instructionResponseOpProcess",
      tenant: process.env.tenant,
      token: process.env.token,
      tags: ["after"],
    },
    args: {
      id: 12656,
    },
  }),
});

console.log(response.status);
