const fs = require("fs"),
  vm = require("vm"),
  path = require("path"),
  ts = require("../node_modules/typescript");
module.exports = function load(file, mocks = {}) {
  const e = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    {
      exports: e,
      require: (n) => {
        if (Object.hasOwn(mocks, n)) return mocks[n];
        const relative = n.startsWith(".")
          ? path.resolve(path.dirname(file), n + ".ts")
          : null;
        if (relative && fs.existsSync(relative)) return load(relative, mocks);
        return require(
          require.resolve(n, { paths: [path.resolve("artifacts/api-server")] }),
        );
      },
      process,
      Buffer,
      Date,
      Map,
      AbortSignal,
      AbortController,
      TextEncoder,
      TextDecoder,
      File,
      Blob,
      URL,
      crypto: require("node:crypto").webcrypto,
      fetch,
      setTimeout,
      clearTimeout,
    },
    { filename: file },
  );
  return e;
};
