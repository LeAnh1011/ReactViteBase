import { defineConfig, loadEnv } from "vite";
import type { PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { resolve } from "path";
import tsNameof from "vite-plugin-ts-nameof";
import ckeditor5 from "@ckeditor/vite-plugin-ckeditor5";

export default defineConfig((context) => {
  const env = loadEnv(context.mode, process.cwd());

  return {
    server: {
      port: 3000,
      open: true,
    },
    define: {
      "process.env": env,
    },
    build: {
      outDir: "build",
      rollupOptions: {
        plugins: [
          {
            name: "disable-treeshake",
            transform(code, id) {
              if (id.endsWith("scss.js")) {
                return { moduleSideEffects: "no-treeshake" };
              }
            },
          },
        ],
      },
    },
    resolve: {
      alias: {
        // resolve static library:
        path: "path-browserify",
        // resolve style paths:
        "~bootstrap": resolve(__dirname, "node_modules/bootstrap"),
        "~antd": resolve(__dirname, "node_modules/antd"),
        "~react3l-ui-library": resolve(
          __dirname,
          "node_modules/react3l-ui-library"
        ),
        // resolve folder paths:
        app: resolve(__dirname, "./src/app/"),
        rtk: resolve(__dirname, "./src/rtk/"),
        assets: resolve(__dirname, "./src/assets/"),
        components: resolve(__dirname, "./src/components/"),
        config: resolve(__dirname, "./src/config/"),
        core: resolve(__dirname, "./src/core/"),
        layout: resolve(__dirname, "./src/layout/"),
        locales: resolve(__dirname, "./src/locales/"),
        models: resolve(__dirname, "./src/models/"),
        pages: resolve(__dirname, "./src/pages/"),
        repositories: resolve(__dirname, "./src/repositories/"),
      },
    },
    plugins: [
      visualizer({
        gzipSize: true,
        template: "treemap",
        filename: "stats/project-bundle-analyzer.html",
        title: "Project Bundle Analyzer",
      }) as PluginOption,

      react({
        babel: {
          parserOpts: {
            plugins: ["decorators-legacy"],
          },
        },
      }),
      ckeditor5({ theme: require.resolve("@ckeditor/ckeditor5-theme-lark") }),
      tsNameof(),
    ],
  };
});
