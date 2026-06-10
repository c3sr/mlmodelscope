const {
  override,
  addDecoratorsLegacy,
  fixBabelImports,
  addWebpackAlias,
  addTslintLoader,
} = require("customize-cra");
const path = require("path");

function resolve(...dir) {
  return path.join(__dirname, ...dir);
}

function resolveSrc(...dir) {
  return path.join(__dirname, "src", ...dir);
}

function rewireSVGR(svgrLoaderOptions) {
  return function (config) {
    const svgReactLoader = {
      test: /\.svg$/,
      use: [
        {
          loader: require.resolve(`@svgr/webpack`),
          options: svgrLoaderOptions,
        },
        {
          loader: "url-loader",
        },
      ],
    };
    config.module.rules.unshift(svgReactLoader);
    return config;
  };
}

function filterBrokenMediaPipeSourceMap(config) {
  const sourceMapLoader = config.module.rules.find(
    rule =>
      rule &&
      rule.loader === require.resolve("source-map-loader")
  );

  if (!sourceMapLoader) {
    return config;
  }

  const mediaPipeBundle = path.join(
    "@mediapipe",
    "tasks-vision",
    "vision_bundle.mjs"
  );

  sourceMapLoader.options = {
    ...sourceMapLoader.options,
    filterSourceMappingUrl(sourceMappingUrl, resourcePath) {
      const isBrokenMediaPipeReference =
        path.normalize(resourcePath).endsWith(mediaPipeBundle) &&
        sourceMappingUrl === "vision_bundle_mjs.js.map";

      return isBrokenMediaPipeReference ? "remove" : "consume";
    }
  };

  return config;
}

function disableWebpackEslint(config) {
  config.plugins = config.plugins.filter(
    plugin => plugin.constructor.name !== "ESLintWebpackPlugin"
  );

  return config;
}

const primaryColor = "#19263a";

module.exports = override(
  filterBrokenMediaPipeSourceMap,
  addDecoratorsLegacy(),
  disableWebpackEslint,
  fixBabelImports("lodash", {
    libraryName: "lodash",
    libraryDirectory: "",
    camel2DashComponentName: false, // default: true
  }),
  addWebpackAlias({
    ["@"]: resolve("src"),
    ["@components"]: resolveSrc("components"),
    ["@context"]: resolveSrc("context"),
    ["@routes"]: resolveSrc("routes"),
    ["@resources"]: resolveSrc("resources"),
    ["@icons"]: resolveSrc("resources", "icons"),
    ["@helpers"]: resolveSrc("helpers"),
    ["@common"]: resolveSrc("common"),
  }),
  addTslintLoader()
);
