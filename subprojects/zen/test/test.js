import fs from "fs";
import yaml from "yaml";

// Carrega o arquivo YAML
// const response = await fetch("https://api.zenerp.app.br/api.yml", {
//   headers: {
//     "tenant": "teste",
//   }
// });
// if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
// const text = await response.text();
// const api = yaml.parse(text);

const fileContent = fs.readFileSync("./api.yml", "utf8");
const api = yaml.parse(fileContent);

const schemas = api.components?.schemas || {};

// Resolve um schema (expande `$ref` e `allOf`) e verifica se tem `company`
function hasCompany(schema, visited = new Set()) {
  if (!schema || typeof schema !== "object") {
    return false;
  }
  if (schema.$ref) {
    const refName = schema.$ref.replace("#/components/schemas/", "");
    if (visited.has(refName)) {
      return false;
    }
    visited.add(refName);
    return hasCompany(schemas[refName], visited);
  }
  if (schema.allOf) {
    return schema.allOf.some(sub => hasCompany(sub, visited));
  }
  if (schema.properties?.company) {
    return true;
  }
  return false;
}

// Extrai GET operations cujo schema (direto ou herdado) tem "company"
const results = [];

for (const [path, methods] of Object.entries(api.paths || {})) {
  const get = methods.get;
  if (!get || !get.responses?.["200"]) {
    continue;
  }

  const schema = get.responses["200"].content?.["application/json"]?.schema;
  if (!schema) {
    continue;
  }

  const targetSchema = schema.items ?? schema;
  if (!targetSchema?.$ref) {
    continue;
  }

  const schemaName = targetSchema.$ref.replace("#/components/schemas/", "");
  if (hasCompany(schemas[schemaName])) {
    results.push(get.operationId);
  }
}

console.log(results);
