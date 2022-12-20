const cliProgress = require("cli-progress");
const colors = require("ansi-colors");
const { traverseFiles } = require("./traverseFiles");

/**
 * Reads all files in the current directory, recursively.
 * Greps imports of `dependency` and returns them.
 */
async function grepImports({ dependency, extensions, exclude }) {
  let numberOfFilesDiscovered = 0;
  let numberOfFilesProcessed = 0;

  const progressBar = new cliProgress.SingleBar({
    format:
      "Progress |" +
      colors.cyan("{bar}") +
      "| {percentage}% || {value}/{total} files",
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  });

  progressBar.start(0, 0);

  const imports = {};
  const regExp = new RegExp(
    `(?<=import)(((?!import).)*)(?=from "${dependency}")`,
    "gms"
  );

  await traverseFiles({
    input: "./",
    extensions,
    onFileDiscovered: () => {
      numberOfFilesDiscovered++;
      progressBar.setTotal(numberOfFilesDiscovered);
    },
    onFileRead: ({ content }) => {
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

      numberOfFilesProcessed++;
      progressBar.update(numberOfFilesProcessed);
    },
    exclude: exclude ? new RegExp(exclude) : undefined,
  });

  progressBar.stop();

  return imports;
}

module.exports = { grepImports };
