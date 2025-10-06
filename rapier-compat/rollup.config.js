import commonjs from "@rollup/plugin-commonjs";
import {nodeResolve} from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import path from "path";
import {base64} from "rollup-plugin-base64";
import copy from "rollup-plugin-copy";
import filesize from "rollup-plugin-filesize";

const config = (dim, features_postfix) => ({
    input: `builds/${features_postfix}/gen${dim}/rapier.ts`,
    output: [
        {
            file: `builds/${features_postfix}/pkg/rapier.mjs`,
            format: "es",
            sourcemap: true,
            exports: "named",
        },
        {
            file: `builds/${features_postfix}/pkg/rapier.cjs`,
            format: "cjs",
            sourcemap: true,
            exports: "named",
        },
    ],
    plugins: [
        copy({
            targets: [
                {
                    src: `builds/${features_postfix}/wasm-build/package.json`,
                    dest: `builds/${features_postfix}/pkg/`,
                    transform(content) {
                        let config = JSON.parse(content.toString());
                        config.name = `@dimforge/rapier${features_postfix}-compat`;
                        config.description +=
                            " Compatibility package with inlined webassembly as base64.";
                        config.types = "rapier.d.ts";
                        config.main = "rapier.cjs";
                        config.module = "rapier.mjs";
                        config.exports = {
                            ".": {
                                types: "./rapier.d.ts",
                                require: "./rapier.cjs",
                                import: "./rapier.mjs",
                            },
                        };
                        // delete config.module;
                        config.files = ["*"];
                        return JSON.stringify(config, undefined, 2);
                    },
                },
                {
                    src: `../rapier${features_postfix}/LICENSE`,
                    dest: `builds/${features_postfix}/pkg`,
                },
                {
                    src: `../rapier${features_postfix}/README.md`,
                    dest: `builds/${features_postfix}/pkg`,
                },
            ],
        }),
        base64({include: "**/*.wasm"}),
        terser(),
        nodeResolve(),
        commonjs(),
        typescript({
            tsconfig: path.resolve(
                __dirname,
                `builds/${features_postfix}/tsconfig.pkg.json`,
            ),
            sourceMap: true,
            inlineSources: true,
        }),
        filesize(),
    ],
});

const allConfigs = [
    ["2d", "2d"],
    ["2d", "2d-deterministic"],
    ["2d", "2d-simd"],
    ["3d", "3d"],
    ["3d", "3d-deterministic"],
    ["3d", "3d-simd"],
];

// Get the target from environment variables
/// Same as in `build-rust.sh`
var feature_postfix_target = process.env.FEATURE_TARGET;
/// 2 or 3
const dim_target = process.env.DIM_TARGET;

console.log(
    `Building for feature target: ${
        feature_postfix_target || "all"
    }, and dimension target: ${dim_target || "all"}`,
);
if (feature_postfix_target == "non-deterministic") {
    feature_postfix_target = dim_target + "d";
} else {
    feature_postfix_target = [dim_target + "d", feature_postfix_target].join(
        "-",
    );
}

var config_to_export;
// Export the configuration based on the target
if (dim_target && feature_postfix_target !== "all") {
    config_to_export = [
        allConfigs.find((config) => config[1] == feature_postfix_target),
    ];
    if (config_to_export[0] == null) {
        config_to_export = allConfigs;
    }
} else {
    config_to_export = allConfigs;
}

console.log(`config_to_export: ${JSON.stringify(config_to_export)}`);

const exported = config_to_export.map((element) =>
    config(element[0], element[1]),
);

export default exported;
