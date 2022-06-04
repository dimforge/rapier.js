const {base64} = require("rollup-plugin-base64");
import {terser} from "rollup-plugin-terser";
import {nodeResolve} from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import filesize from "rollup-plugin-filesize";
import copy from "rollup-plugin-copy";
import path from "path";

const config = (dim) => ({
    input: `./gen${dim}/rapier.ts`,
    output: [
        {
            file: `pkg${dim}/rapier.es.js`,
            format: "es",
            sourcemap: true,
            exports: "named",
        },
        {
            file: `pkg${dim}/rapier.cjs.js`,
            format: "cjs",
            sourcemap: true,
            exports: "named",
        },
    ],
    plugins: [
        copy({
            targets: [
                {
                    src: `../rapier${dim}/pkg/package.json`,
                    dest: `./pkg${dim}/`,
                    transform(content) {
                        let config = JSON.parse(content.toString());
                        config.name = `@dimforge/rapier${dim}-compat`;
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
                    src: `../rapier${dim}/LICENSE`,
                    dest: `./pkg${dim}`,
                },
                {
                    src: `../rapier${dim}/README.md`,
                    dest: `./pkg${dim}`,
                },
            ],
        }),
        base64({include: "**/*.wasm"}),
        terser(),
        nodeResolve(),
        commonjs(),
        typescript({
            tsconfig: path.resolve(__dirname, `tsconfig.pkg${dim}.json`),
            include: [`./gen${dim}/**/*.ts`, `./src${dim}/*`],
            sourceMap: true,
            inlineSources: true,
        }),
        filesize(),
    ],
});

export default [config("2d"), config("3d")];
