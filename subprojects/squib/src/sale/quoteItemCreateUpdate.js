import "dotenv/config";

export async function quoteItemCreateUpdate(zenReq) {
  const args = zenReq.body.args;

  const props = [];
  if (args.bean?.properties?.brand)
    props.push(`Marca: ${args.bean.properties.brand}`);
  if (args.bean?.properties?.origin)
    props.push(`Origem: ${args.bean.properties.origin}`);
  if (args.bean?.properties?.weight)
    props.push(`Peso: ${args.bean.properties.weight}`);

  const lines = args.bean?.properties?.comments ? args.bean?.properties?.comments.split('\n') : [];
  const index = lines.findIndex(line => line.startsWith('# '));

  if (props.length) {
    const line = `# ${props.join(', ')}`;

    if (index >= 0) {
      lines[index] = line;
    } else {
      lines.push(line);
    }

  } else if (index >= 0) {
    lines.splice(index, 1);
  }
  
  args.bean.properties.comments = lines.join('\n');

  return {
    body: {
      args,
    },
  };
}
