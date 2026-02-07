import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "node:path";
import { apiKeyAuth } from "../middleware/auth.js";
import { MAX_FILE_SIZE } from "../config/env.js";
import { optimizeVideo, sanitizeCompressionOptions } from "../services/ffmpeg.js";
import { ensureDir, safeUnlink } from "../utils/file.js";

const router = Router();

const upload = multer({
  dest: "tmp/uploads",
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback
  ) => {
    const allowed = ["video/mp4", "video/webm", "video/avi", "video/quicktime"];
    console.log("[multer] fileFilter", {
      mimetype: file.mimetype,
      originalname: file.originalname,
      size: file.size
    });
    if (!allowed.includes(file.mimetype)) {
      callback(new Error("Unsupported file type"));
      return;
    }
    callback(null, true);
  }
});

router.post(
  "/optimize",
  apiKeyAuth,
  upload.single("video"),
  async (req: Request, res: Response, next: NextFunction) => {
    const requestId = `opt-${Date.now()}`;
    console.log(`[${requestId}] Incoming optimize request`, {
      ip: req.ip,
      contentType: req.headers["content-type"],
      contentLength: req.headers["content-length"]
    });

    try {
      if (!req.file) {
        console.log(`[${requestId}] Missing video file`);
        res.status(400).json({ error: "Video file is required" });
        return;
      }

      console.log(`[${requestId}] Upload received`, {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      });

      // Parse compression options from form fields
      const rawOptions: Record<string, unknown> = {};
      for (const key of ["crf", "preset", "width", "fps", "audioBitrate", "videoCodec", "audioCodec"]) {
        if (req.body[key] !== undefined) {
          rawOptions[key] = req.body[key];
        }
      }
      const compressionOptions = sanitizeCompressionOptions(rawOptions);
      console.log(`[${requestId}] Compression options`, compressionOptions);

      await ensureDir(path.dirname(req.file.path));
      await ensureDir("tmp/optimized");

      console.log(`[${requestId}] Starting optimization`);
      const outputPath = await optimizeVideo(req.file.path, "tmp/optimized", requestId, compressionOptions);
      console.log(`[${requestId}] Optimization finished`, { outputPath });

      res.setHeader("Content-Type", "video/mp4");
      res.download(
        outputPath,
        "optimized.mp4",
        async (error: NodeJS.ErrnoException | null) => {
          console.log(`[${requestId}] Response download completed`, {
            error: error?.message ?? null
          });
          await safeUnlink(req.file?.path ?? "");
          await safeUnlink(outputPath);

          if (error) {
            next(error);
          }
        }
      );
    } catch (error) {
      console.error(`[${requestId}] Optimization failed`, error);
      next(error);
    }
  }
);

export default router;
