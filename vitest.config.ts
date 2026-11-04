import { fileURLToPath } from "node:url";
import { mergeConfig, defineConfig, configDefaults } from "vitest/config";
import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      execArgv: process.allowedNodeEnvironmentFlags.has(
        "--no-experimental-webstorage",
      )
        ? ["--no-experimental-webstorage"]
        : [],
      silent: true,
      // apps/* run their own test runners (apps/web: ng test).
      exclude: [...configDefaults.exclude, "e2e/**", ".claude/**", "apps/**"],
      root: fileURLToPath(new URL("./", import.meta.url)),
    },
  }),
);
