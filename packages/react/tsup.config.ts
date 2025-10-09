import { defineConfig } from "tsup";
import { exec } from "node:child_process";
import { preserveDirectivesPlugin } from "esbuild-plugin-preserve-directives";

export default defineConfig((options) => [
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    splitting: false,
    treeshake: true,
    sourcemap: true,
    dts: true,
    clean: true,
    external: ["react"],
    outDir: "dist",
    outExtension({ format }) {
      return {
        js: format === "esm" ? ".mjs" : ".cjs",
      };
    },
    banner: {
      js: '"use client";',
    },
    onSuccess: async () => {
      exec("tsc --emitDeclarationOnly");
    },
    metafile: true,
    esbuildPlugins: [
      preserveDirectivesPlugin({
        directives: ["use client", "use strict"],
        include: /\.(js|ts|jsx|tsx)$/,
        exclude: /node_modules/,
      }),
    ],
    ...options,
  },
]);
