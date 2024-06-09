import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolver from "@rollup/plugin-node-resolve";

export default {
  input: "lambda.js",
  output: [
    {
      file: "dist/lambda/index.mjs",
      format: "es",
    },
  ],
  plugins: [
    resolver(),
    commonjs(),
    json(),
  ],
  onwarn(warning ) {
    if (warning.code === "CIRCULAR_DEPENDENCY")
      return;
    console.warn(warning.message);
  },
};