const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function setupProxy(app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:8005",
      changeOrigin: true,
      pathRewrite: { "^/api": "" }
    })
  );
};
