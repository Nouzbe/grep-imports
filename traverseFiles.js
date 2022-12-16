const path = require("path");
const { readdir, stat, readFile } = require("fs-extra");

/**
 * Traverses all files matching `extensions` recursively from the current directory.
 * Invokes `callback` for each of them.
 */
async function traverseFiles({ input, extensions, callback, exclude }) {
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
        const content = await readFile(fileName, "utf8");
        callback({
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
        callback,
      })
    ),
  ]);
}

traverseFiles({
  input: "./",
  extensions: ["js"],
  callback: ({ path, fileName, content }) => {
    console.log(
      "callback invoked with ",
      JSON.stringify({ path, fileName, content }, undefined, 2)
    );
  },
  exclude: new RegExp("node_modules"),
});

module.exports = {
  traverseFiles,
};
