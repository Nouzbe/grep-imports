const { traverseFiles } = require("./traverseFiles");

/**
 * Reads all files in the current directory, recursively.
 * Greps imports of `dependency` and returns them.
 */
async function grepImports({ dependency, extensions, exclude }) {
  const imports = {};
  const regExp = new RegExp(
    `(?<=import)(((?!import).)*)(?=from "${dependency}")`,
    "gms"
  );

  await traverseFiles({
    input: "./",
    extensions,
    onFileDiscovered: (path) => {
      console.log(`Discovered file ${path}`);
    },
    onFileRead: ({ path, fileName, content }) => {
      const result = regExp.exec(content);
      if (result) {
        const importNames = result[1].replace(/\s|{|}/g, "").split(",");

        importNames.forEach((importName) => {
          if (!imports[importName]) {
            imports[importName] = 0;
          }
          imports[importName]++;
        });
      }
    },
    exclude: exclude ? new RegExp(exclude) : undefined,
  });

  return imports;
}

module.exports = { grepImports };
