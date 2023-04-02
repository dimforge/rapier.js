const {spawn} = require("child_process");
const fse = require("fs-extra");
const fs = require("fs");
const path = require("path");

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
        if (
            process.platform.startsWith("win") &&
            key.toLowerCase() === "path"
        ) {
            // wasm-opt doesn't work from node modules so use this hack
            const paths = value.split(";");
            return [
                key,
                paths
                    .filter((item) => item.indexOf("node_modules") === -1)
                    .join(";"),
            ];
        }

        return [key, value];
    });
    const newEnv = Object.fromEntries(newEnvEntries);
    await wait(
        spawn("wasm-pack", ["build"], {
            shell: true,
            stdio: "inherit",
            cwd: "./rapier3d/",
            env: newEnv,
        }),
    );
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
    fs.writeFileSync(
        packageJsonPath,
        fs
            .readFileSync(packageJsonPath)
            .toString()
            .replaceAll("dimforge_rapier", "@dimforge/rapier")
            .replaceAll("rapier_wasm3d_bg.wasm", "*"),
    );

    // rm pkg/.gitignore
    fs.rmSync("./rapier3d/pkg/.gitignore");
};

const walk = function (directoryName, callback) {
    fs.readdir(directoryName, function (e, files) {
        if (e) {
            console.log("Error: ", e);
            return;
        }
        files.forEach(function (file) {
            const fullPath = path.join(directoryName, file);
            fs.stat(fullPath, function (e, f) {
                if (e) {
                    console.log("Error: ", e);
                    return;
                }
                if (f.isDirectory()) {
                    walk(fullPath, callback);
                } else {
                    callback(fullPath);
                    // console.log('- ' + fullPath);
                }
            });
        });
    });
};

const buildTypescript = async () => {
    // mkdir -p ./pkg/src
    fs.mkdirSync("./rapier3d/pkg/src", {recursive: true});

    // cp -r ../src.ts/* pkg/src/.
    fse.copySync("./src.ts", "./rapier3d/pkg/src/", {
        overwrite: true,
    });

    // rm -f ./pkg/raw.ts
    const rawTsPath = "./rapier3d/pkg/src/raw.ts";
    if (fs.existsSync(rawTsPath)) {
        fs.rmSync(rawTsPath);
    }

    // echo 'export * from "./rapier_wasm3d"' > pkg/src/raw.ts
    fs.writeFileSync(rawTsPath, 'export * from "./rapier_wasm3d"');

    // find pkg/ -type f -print0 | LC_ALL=C xargs -0 sed -i.bak '\:#if DIM2:,\:#endif:d'
    walk("./rapier3d/pkg/", (path) => {
        // console.log('path', path);
        const fileContents = fs.readFileSync(path).toString();
        const regex = /\n?\/\/\s+#if\s+DIM2([\s\S]|.)*?#endif\s*\n?/gm;
        const match = fileContents.match(regex);
        if (match) {
            // console.log(path, match);
            fs.writeFileSync(path, fileContents.replaceAll(regex, ""));
        }
    });

    // npx tsc
    console.log("npx tsc");
    await wait(
        spawn("npx", ["tsc"], {
            shell: true,
            stdio: "inherit",
            cwd: "./rapier3d/",
        }),
    );

    const packageJsonPath = "./rapier3d/pkg/package.json";
    if (!fs.existsSync(packageJsonPath)) {
        throw new Error("Cannot find package json in rapier3d/pkg.");
    }

    // # NOTE: we keep the typescripts files into the NPM package for source mapping: see #3
    // sed -i.bak 's/"module": "rapier_wasm3d.js"/"module": "rapier.js"/g' pkg/package.json
    // sed -i.bak 's/"types": "rapier_wasm3d.d.ts"/"types": "rapier.d.ts"/g' pkg/package.json
    // find pkg/ -type f -name '*.bak' | xargs rm
    fs.writeFileSync(
        packageJsonPath,
        fs
            .readFileSync(packageJsonPath)
            .toString()
            .replaceAll(
                /"module":\s*"rapier_wasm3d.js"/g,
                '"module": "rapier.js"',
            )
            .replaceAll(
                /"types":\s*"rapier_wasm3d.d.ts"/g,
                '"types": "rapier.d.ts"',
            ),
    );
};

const buildDoc = async () => {
    // npx typedoc --tsconfig tsconfig_typedoc.json
    console.log("npx typedoc --tsconfig tsconfig_typedoc.json");
    await wait(
        spawn("npx", ["typedoc", "--tsconfig", "tsconfig_typedoc.json"], {
            shell: true,
            stdio: "inherit",
            cwd: "./rapier3d/",
        }),
    );
};

(async () => {
    // rm -rf pkg
    fs.rmSync("./rapier3d/pkg/", {recursive: true, force: true});

    // ./build_rust.sh
    await buildRust();

    // ./build_typescript.sh
    await buildTypescript();

    // ./build_doc.sh
    await buildDoc();
})();
