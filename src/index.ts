import app from "./app.js";
import { PORT } from "./config/env.js";
import { ensureDir } from "./utils/file.js";

await ensureDir("tmp/uploads");
await ensureDir("tmp/optimized");

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
