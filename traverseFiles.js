const path = require("path");
const { readdir, stat, readFile } = require("fs-extra");

/**
 * Traverses all files matching `extensions` recursively from the current directory.
 * Invokes `onFileDiscovered` and `onFileRead` for each of them.
 */
async function traverseFiles({
  input,
  extensions,
  onFileDiscovered,
  onFileRead,
  exclude,
}) {
  const namesOfFilesAndSubfolders = (await readdir(input))
    .map((name) => path.join(input, name))
    .filter((name) => !exclude || !exclude.test(name));

  const stats = await Promise.all(
    namesOfFilesAndSubfolders.map((name) => stat(name))
  );

  const subfolderNames = [];
  const fileNames = [];

  for (let i = 0; i < stats.length; i++) {
    (stats[i].isDirectory() ? subfolderNames : fileNames).push(
      namesOfFilesAndSubfolders[i]
    );
  }

  await Promise.all([
    ...fileNames
      .filter((fileName) =>
        extensions.some((extension) => fileName.endsWith(extension))
      )
      .map(async (fileName) => {
        onFileDiscovered(fileName);
        const content = await readFile(fileName, "utf8");
        onFileRead({
          path: input,
          fileName,
          content,
        });
      }),
    ...subfolderNames.map((subfolderName) =>
      traverseFiles({
        input: subfolderName,
        extensions,
        exclude,
        onFileDiscovered,
        onFileRead,
      })
    ),
  ]);
}

module.exports = {
  traverseFiles,
};
