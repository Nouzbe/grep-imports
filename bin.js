#!/usr/bin/env node
const yargs = require("yargs/yargs");
const { writeFile } = require("fs-extra");
const { grepImports } = require("./grepImports");

const argv = yargs(process.argv.slice(2))
  .scriptName("grep-imports")
  .usage("Usage: $0 [options]")
  .command(
    "$0",
    "greps all named imports of a given dependency and outputs them in a file"
  )
  .example(
    "$0 count -d @activeviam/activeui-sdk -o activeui-sdk-imports.csv",
    "greps all named imports from @activeviam/activeui-sdk"
  )
  .options({
    d: { alias: "dependency", type: "string", demandOption: true },
    e: {
      alias: "extensions",
      type: "array",
      default: ["js", "jsx", "ts", "tsx"],
    },
    o: { alias: "output", type: "string", default: "output.csv" },
    x: { alias: "exclude", type: "string", default: "node_modules" },
  }).argv;

const { dependency, exclude, extensions, output } = argv;

async function grepAndOutputImports() {
  const imports = await grepImports({ dependency, extensions, exclude });

  let content = ``;
  for (const importName in imports) {
    content += `${importName},${imports[importName]}\n`;
  }

  await writeFile(output, content);
}

grepAndOutputImports();
