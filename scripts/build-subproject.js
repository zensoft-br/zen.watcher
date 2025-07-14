import { execSync } from "node:child_process";
import { createReadStream, createWriteStream, existsSync, mkdirSync } from "node:fs";
import { pipeline } from "node:stream";
import { createGzip } from "node:zlib";

const tenant = process.argv[2];
if (!tenant) {
  console.error("Usage: node scripts/build-tenant.js <tenant-name>");
  process.exit(1);
}

const dir = `subprojects/${tenant}`;
const input = `${dir}/src/index.js`;
const output = `${dir}/dist/index.js`;
const zipOutput = `${dir}/dist/index.zip`;

if (!existsSync(input)) {
  console.error(`Input file not found: ${input}`);
  process.exit(1);
}

console.log(`> Linting ${tenant}`);
execSync(`eslint ${dir}/src --ext .js,.mjs`, { stdio: "inherit" });

console.log(`> Building ${tenant}`);
execSync(`esbuild ${input} --bundle --platform=node --outfile=${output}`, { stdio: "inherit" });

console.log(`> Zipping ${tenant}`);
mkdirSync(`${dir}/dist`, { recursive: true });
const source = createReadStream(output);
const dest = createWriteStream(zipOutput);
const gzip = createGzip();

pipeline(source, gzip, dest, (err) => {
  if (err) {
    console.error("Error zipping:", err);
    process.exit(1);
  } else {
    console.log(`> Done: ${zipOutput}`);
  }
});
