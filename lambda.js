import { watch } from "./watcher";

export const handler = async (event) => {
  const body = JSON.parse(event.body);
  const result = watch(body);

  return {
    statusCode: 200,
    body: result,
    headers: {
      "content-type": "application/json",
    },
  };
};