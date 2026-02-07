import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import path from "node:path";
import { ensureDir } from "../utils/file.js";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export interface CompressionOptions {
  /** CRF value (0–51). Lower = better quality, bigger file. Default: 30 */
  crf?: number;
  /** x264 preset. Default: "slow" */
  preset?: "ultrafast" | "superfast" | "veryfast" | "faster" | "fast" | "medium" | "slow" | "slower" | "veryslow";
  /** Output width in pixels. Height is calculated automatically. Default: 854 */
  width?: number;
  /** Output framerate. Default: 24 */
  fps?: number;
  /** Audio bitrate (e.g. "96k", "128k", "192k"). Default: "96k" */
  audioBitrate?: string;
  /** Video codec. Default: "libx264" */
  videoCodec?: "libx264" | "libx265";
  /** Audio codec. Default: "aac" */
  audioCodec?: "aac" | "libopus";
}

const VALID_PRESETS = ["ultrafast", "superfast", "veryfast", "faster", "fast", "medium", "slow", "slower", "veryslow"];
const VALID_VIDEO_CODECS = ["libx264", "libx265"];
const VALID_AUDIO_CODECS = ["aac", "libopus"];
const AUDIO_BITRATE_RE = /^\d+k$/;

export function sanitizeCompressionOptions(raw: Record<string, unknown>): CompressionOptions {
  const opts: CompressionOptions = {};

  if (raw.crf !== undefined) {
    const crf = Number(raw.crf);
    if (!Number.isNaN(crf) && crf >= 0 && crf <= 51) opts.crf = crf;
  }
  if (raw.preset !== undefined && VALID_PRESETS.includes(String(raw.preset))) {
    opts.preset = String(raw.preset) as NonNullable<CompressionOptions["preset"]>;
  }
  if (raw.width !== undefined) {
    const w = Number(raw.width);
    if (!Number.isNaN(w) && w >= 240 && w <= 3840) opts.width = Math.round(w);
  }
  if (raw.fps !== undefined) {
    const fps = Number(raw.fps);
    if (!Number.isNaN(fps) && fps >= 1 && fps <= 120) opts.fps = fps;
  }
  if (raw.audioBitrate !== undefined && AUDIO_BITRATE_RE.test(String(raw.audioBitrate))) {
    opts.audioBitrate = String(raw.audioBitrate);
  }
  if (raw.videoCodec !== undefined && VALID_VIDEO_CODECS.includes(String(raw.videoCodec))) {
    opts.videoCodec = String(raw.videoCodec) as NonNullable<CompressionOptions["videoCodec"]>;
  }
  if (raw.audioCodec !== undefined && VALID_AUDIO_CODECS.includes(String(raw.audioCodec))) {
    opts.audioCodec = String(raw.audioCodec) as NonNullable<CompressionOptions["audioCodec"]>;
  }

  return opts;
}

export async function optimizeVideo(
  inputPath: string,
  outputDir: string,
  requestId?: string,
  options?: CompressionOptions
): Promise<string> {
  await ensureDir(outputDir);

  const crf = options?.crf ?? 30;
  const preset = options?.preset ?? "slow";
  const width = options?.width ?? 854;
  const fps = options?.fps ?? 24;
  const audioBitrate = options?.audioBitrate ?? "96k";
  const videoCodec = options?.videoCodec ?? "libx264";
  const audioCodec = options?.audioCodec ?? "aac";

  const outputPath = path.join(
    outputDir,
    `optimized-${Date.now()}-${path.basename(inputPath, path.extname(inputPath))}.mp4`
  );

  return await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        `-c:v ${videoCodec}`,
        `-crf ${crf}`,
        `-preset ${preset}`,
        `-vf scale=${width}:-2`,
        `-r ${fps}`,
        `-c:a ${audioCodec}`,
        `-b:a ${audioBitrate}`,
        "-movflags +faststart",
        "-pix_fmt yuv420p"
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
