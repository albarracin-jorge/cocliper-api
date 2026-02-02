import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import path from "node:path";
import { ensureDir } from "../utils/file.js";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function optimizeVideo(
  inputPath: string,
  outputDir: string,
  requestId?: string
): Promise<string> {
  await ensureDir(outputDir);

  const outputPath = path.join(
    outputDir,
    `optimized-${Date.now()}-${path.basename(inputPath, path.extname(inputPath))}.mp4`
  );

  return await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-c:v libx264",
        "-crf 30",
        "-preset slow",
        "-vf scale=854:-2",
        "-r 24",
        "-c:a aac",
        "-b:a 96k",
        "-movflags +faststart"
      ])
      .on("start", (commandLine) => {
        if (requestId) {
          console.log(`[${requestId}] ffmpeg start`, { commandLine });
        }
      })
      .on("progress", (progress) => {
        if (requestId && progress.percent !== undefined) {
          console.log(`[${requestId}] ffmpeg progress`, {
            percent: Math.round(progress.percent)
          });
        }
      })
      .on("end", () => {
        if (requestId) {
          console.log(`[${requestId}] ffmpeg end`);
        }
        resolve(outputPath);
      })
      .on("error", (error: Error) => {
        if (requestId) {
          console.error(`[${requestId}] ffmpeg error`, error);
        }
        reject(error);
      })
      .save(outputPath);
  });
}
