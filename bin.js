#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

void yargs(hideBin(process.argv))
  .command(
    "$0",
    "Greps all imports from a dependency",
    (args) => {
      args.option("dependency", {
        alias: "d",
        desc: "The name of the dependency whose imports are grepped",
      });
      args.option("extensions", {
        alias: "e",
        array: true,
        default: ["js", "jsx", "ts", "tsx"],
        desc: "The extensions of the files from which imports are grepped.",
      });
      args.option("output", {
        alias: "o",
        default: "imports.txt",
        desc: "Path to the output file.",
      });
    },
    ({ dependency, extensions, output }) => {
      // /import (.+?) from "@activeviam\/activeui-sdk";/gms
      console.log(
        "hello world!",
        JSON.stringify({ dependency, extensions, output }, undefined, 2)
      );
    }
  )
  .demand("dependency")
  .parse();
