import commonjs from "@rollup/plugin-commonjs";
import {nodeResolve} from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import path from "path";
import {base64} from "rollup-plugin-base64";
import copy from "rollup-plugin-copy";
import filesize from "rollup-plugin-filesize";
import * as fs from 'fs';

const config = (dim, js_package_name) => ({
    input: `builds/${js_package_name}/gen${dim}/rapier.ts`,
    output: [
        {
            file: `builds/${js_package_name}/pkg/rapier.es.js`,
            format: "es",
            sourcemap: true,
            exports: "named",
        },
        {
            file: `builds/${js_package_name}/pkg/rapier.cjs.js`,
            format: "cjs",
            sourcemap: true,
            exports: "named",
        },
    ],
    plugins: [
        copy({
            targets: [
                {
                    src: `builds/${js_package_name}/wasm-build/package.json`,
                    dest: `builds/${js_package_name}/pkg/`,
                    transform(content) {
                        let config = JSON.parse(content.toString());
                        config.name = `@dimforge/${js_package_name}`;
                        config.description +=
                            " Compatibility package with inlined webassembly as base64.";
                        config.types = "rapier.d.ts";
                        config.main = "rapier.cjs.js";
                        config.module = "rapier.es.js";
                        // delete config.module;
                        config.files = ["*"];
                        return JSON.stringify(config, undefined, 2);
                    },
                },
                {
                    src: `../${js_package_name}/LICENSE`,
                    dest: `builds/${js_package_name}/pkg`,
                },
                {
                    src: `../${js_package_name}/README.md`,
                    dest: `builds/${js_package_name}/pkg`,
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
                `builds/${js_package_name}/tsconfig.pkg.json`,
            ),
            sourceMap: true,
            inlineSources: true,
        }),
        filesize(),
    ],
});

const conf = JSON.parse(fs.readFileSync('../builds/prepare_builds/assets/' + process.env.BUILD_CONFIG_NAME + '.json'));


export default [
    config("" + conf.dim + "d", conf.js_package_name),
];