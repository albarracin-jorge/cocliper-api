import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import optimizeRouter from "./routes/optimize.js";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api", optimizeRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    res.status(status).json({ error: err.message, code: err.code });
    return;
  }

  const status = err.message.includes("Unsupported file type") ? 415 : 500;
  res.status(status).json({ error: err.message });
});

export default app;
