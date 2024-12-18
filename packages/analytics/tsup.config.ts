import { defineConfig } from "tsup";
import { exec } from "node:child_process";

export default defineConfig((options) => ({
  entry: ["src/index.ts", "src/client/index.ts"],
  splitting: false,
  treeshake: true,
  sourcemap: true,
  clean: true,
  outDir: "dist", // Where you want your compiled files to live
  onSuccess: async () => {
    exec("tsc --emitDeclarationOnly");
  },
  ...options,
}));
