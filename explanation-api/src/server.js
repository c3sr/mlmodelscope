import "dotenv/config";
import { createApp } from "./app.js";
import { createExplainerFromEnv } from "./explainerFactory.js";

const port = Number(process.env.PORT || 8090);
const host = process.env.HOST || "127.0.0.1";
const maxFileSizeBytes = Number(process.env.MAX_IMAGE_BYTES || 10 * 1024 * 1024);
const maxFiles = Number(process.env.MAX_IMAGE_ATTACHMENTS || 4);

const explainer = createExplainerFromEnv();

createApp({ explainer, maxFileSizeBytes, maxFiles }).listen(port, host, () => {
  console.log(`Explanation API listening on http://${host}:${port} using ${explainer.model}`);
});
