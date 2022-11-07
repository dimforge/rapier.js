const { spawn } = require("child_process");
const fs = require("fs");

/**
 *
 * @param {ChildProcess} item
 */
const wait = (item) => {
  return new Promise((resolve, reject) => {
    item.on("exit", () => {
      if (item.exitCode === 0) {
        return resolve();
      }

      return reject(item.exitCode);
    });
  });
};

const wasmPackBuild = async () => {
  /**
   * @type {[string, string][]}
   */
  const newEnvEntries = Object.entries(process.env).map(([key, value]) => {
    if (process.platform.startsWith("win") && key.toLowerCase() === "path") {
      // wasm-opt doesn't work from node modules so use this hack
      const paths = value.split(";");
      return [key, paths.filter(item => item.indexOf("node_modules") === -1).join(";")];
    }

    return [key, value];
  });
  const newEnv = Object.fromEntries(newEnvEntries);
  await wait(spawn("wasm-pack", ["build"], {
    shell: true,
    stdio: "inherit",
    cwd: "./rapier3d/",
    env: newEnv
  }));
};

const buildRust = async () => {
  await wasmPackBuild();
  const packageJsonPath = "./rapier3d/pkg/package.json";
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error("Cannot find package json in rapier3d/pkg.");
  }

  // sed -i.bak 's#dimforge_rapier#@dimforge/rapier#g' pkg/package.json
  // sed -i.bak 's/"rapier_wasm3d_bg.wasm"/"*"/g' pkg/package.json
  // rm pkg/*.bak
  fs.writeFileSync(packageJsonPath, fs
    .readFileSync(packageJsonPath)
    .toString()
    .replaceAll("dimforge_rapier", "@dimforge/rapier")
    .replaceAll("rapier_wasm3d_bg.wasm", "*")
  );

  // rm pkg/.gitignore
  fs.rmSync("./rapier3d/pkg/.gitignore");
};

const buildTypescript = async () => {
  
};

(async () => {
  // rm -rf pkg
  fs.rmSync("./rapier3d/pkg/", { recursive: true, force: true });

  // ./build_rust.sh
  await buildRust();

  // ./build_typescript.sh
  await buildTypescript();
})();
