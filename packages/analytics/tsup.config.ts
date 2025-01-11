import { defineConfig } from "tsup";
import { exec } from "node:child_process";
import { preserveDirectivesPlugin } from "esbuild-plugin-preserve-directives";

export default defineConfig((options) => [
  {
    entry: ["src/index.ts", "src/server/index.ts", "src/plugin/index.ts"],
    splitting: false,
    treeshake: true,
    sourcemap: true,
    dts: true,
    clean: true,
    external: ["next", "react"],
    outDir: "dist", // Where you want your compiled files to live
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
