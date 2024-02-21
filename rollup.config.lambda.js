import resolver from "@rollup/plugin-node-resolve";

export default {
  input: "lambda.js",
  output: [
    {
      file: "dist/lambda/index.mjs",
      format: "es",
    },
  ],
  plugins: [resolver()],
};