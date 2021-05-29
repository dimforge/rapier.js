const CreateFileWebpack = require("create-file-webpack");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

function matchOtherDimRegex({is2d}) {
    if (is2d) {
        return /^ *\/\/ *#if +DIM3[\s\S]*?(?=#endif)#endif/gm;
    } else {
        return /^ *\/\/ *#if +DIM2[\s\S]*?(?=#endif)#endif/gm;
    }
}

function initCode({is2d}) {
    let dim = is2d ? "2d" : "3d";

    return `
// @ts-ignore
import wasmBase64 from "url-loader!./rapier_wasm${dim}_bg.wasm";
import wasmInit from "./rapier_wasm${dim}";

/**
 * Initializes RAPIER.
 * Has to be called and awaited before using any library methods.
 */
export async function init() {
  let base64 = (wasmBase64 as string).replace(
    "data:application/wasm;base64,",
    ""
  );
  let bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  await wasmInit(bytes);
}
`;
}

function copyAndReplace({is2d}) {
    let dim = is2d ? "2d" : "3d";

    return {
        mode: "production",
        entry: {},
        plugins: [
            new CopyPlugin({
                patterns: [
                    // copy src.ts into pkg for compiling,
                    // remove sections wrapped in #ifdef DIMx ... #endif
                    // add init() function to rapier.ts
                    // copy typescript sources into compat to support source mapping (see #3)
                    {
                        from: path.resolve(__dirname, "../src.ts"),
                        to: path.resolve(__dirname, `./pkg${dim}/`),
                        transform(content, path) {
                            let result = content
                                .toString()
                                .replace(matchOtherDimRegex({is2d}), "");

                            if (path.endsWith("/rapier.ts")) {
                                result += initCode({is2d});
                            }
                            return result;
                        },
                        filter: (path) => !path.endsWith("raw.ts"),
                    },
                    // copy package.json, adapting entries, LICENSE and README.md
                    {
                        from: path.resolve(__dirname, `../rapier${dim}/pkg/package.json`),
                        to: path.resolve(__dirname, `./pkg${dim}/package.json`),
                        transform(content) {
                            let config = JSON.parse(content.toString());
                            config.name = `@dimforge/rapier${dim}-compat`;
                            config.description += " Compatibility package with inlined webassembly as base64.";
                            config.types = "rapier.d.ts";
                            config.main = "rapier.js";
                            config.files = ["*"];
                            delete config.module;

                            return JSON.stringify(config, undefined, 2);
                        },
                    },
                    {
                        from: path.resolve(__dirname, `../rapier${dim}/pkg/LICENSE`),
                        to: path.resolve(__dirname, `./pkg${dim}`),
                    },
                    {
                        from: path.resolve(__dirname, `../rapier${dim}/pkg/README.md`),
                        to: path.resolve(__dirname, `./pkg${dim}/README.md`),
                    },
                    {
                        context: path.resolve(__dirname, `../rapier${dim}/pkg/`),
                        from: 'rapier_wasm*',
                        to: path.resolve(__dirname, `./pkg${dim}/`),
                    },
                ],
            }),
            // ts files import from raw.ts, create the file reexporting the wasm-bindgen exports.
            // the indirection simplifies switching between 2d and 3d
            new CreateFileWebpack({
                path: path.resolve(__dirname, `./pkg${dim}/`),
                fileName: "raw.ts",
                content: `export * from "./rapier_wasm${dim}"`,
            }),
        ],
    };
}

function compile({is2d}) {
    let dim = is2d ? "2d" : "3d";

    return {
        mode: "production",
        entry: `./pkg${dim}/rapier.ts`,

        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader",
                    exclude: /node_modules/,
                    options: {
                        configFile: `tsconfig.pkg${dim}.json`,
                    },
                },
            ],
        },
        resolve: {
            extensions: [".tsx", ".ts", ".js"],
        },
        output: {
            filename: "rapier.js",
            path: path.resolve(__dirname, `pkg${dim}`),
            library: "RAPIER",
            libraryTarget: "umd",
        },
    };
}

// Webpack doesn't really handle files that are both inputs and outputs. Instead, run
// webpack twice, once to genrate the source, and once to compile it.
module.exports = env => env.phase === "1" ? [
    // 2d
    copyAndReplace({is2d: true}),

    // 3d
    copyAndReplace({is2d: false}),
] : [
    // 2d
    compile({is2d: true}),

    // 3d
    compile({is2d: false}),
];
