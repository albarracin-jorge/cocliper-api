import dotenv from "dotenv";

dotenv.config();

const apiKeyHash = process.env.API_KEY_HASH;
if (!apiKeyHash) {
  throw new Error("API_KEY_HASH is required");
}

const port = Number(process.env.PORT ?? "3000");
const maxFileSize = Number(
  process.env.MAX_FILE_SIZE ?? String(4 * 1024 * 1024 * 1024)
);

export const API_KEY_HASH = apiKeyHash;
export const PORT = Number.isNaN(port) ? 3000 : port;
export const MAX_FILE_SIZE = Number.isNaN(maxFileSize)
  ? 4 * 1024 * 1024 * 1024
  : maxFileSize;
