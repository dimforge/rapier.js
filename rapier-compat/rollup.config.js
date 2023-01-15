import commonjs from "@rollup/plugin-commonjs";
import {nodeResolve} from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import path from "path";
import {base64} from "rollup-plugin-base64";
import copy from "rollup-plugin-copy";
import filesize from "rollup-plugin-filesize";

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
                    src: `./wasm-build${dim}/package.json`,
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
            sourceMap: true,
            inlineSources: true,
        }),
        filesize(),
    ],
});

export default [config("2d"), config("3d")];
