import fs from "fs";
import path from "path";

const logsDir = path.resolve(import.meta.dirname, "..", "logs");

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const backendLogPath = path.join(logsDir, "backend.log");
const frontendLogPath = path.join(logsDir, "frontend.log");

export type LogSource = "backend" | "frontend" | "express" | "vite";

function getTimestamp(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function log(message: string, source: LogSource = "express") {
  const timestamp = getTimestamp();
  const logMessage = `${timestamp} [${source.toUpperCase()}] ${message}`;

  // Console output
  console.log(logMessage);

  // File output
  try {
    let targetFile = backendLogPath;
    if (source === "frontend" || source === "vite") {
      targetFile = frontendLogPath;
    }

    fs.appendFileSync(targetFile, logMessage + "\n", {
      encoding: "utf-8",
    });
  } catch (err) {
    console.error("Failed to write to log file:", err);
  }
}

export function clearLogs() {
  try {
    if (fs.existsSync(backendLogPath)) {
      fs.unlinkSync(backendLogPath);
    }
    if (fs.existsSync(frontendLogPath)) {
      fs.unlinkSync(frontendLogPath);
    }
  } catch (err) {
    console.error("Failed to clear logs:", err);
  }
}

export function getLogsDir(): string {
  return logsDir;
}

export function readBackendLogs(): string {
  try {
    if (fs.existsSync(backendLogPath)) {
      return fs.readFileSync(backendLogPath, "utf-8");
    }
  } catch (err) {
    console.error("Failed to read backend logs:", err);
  }
  return "";
}

export function readFrontendLogs(): string {
  try {
    if (fs.existsSync(frontendLogPath)) {
      return fs.readFileSync(frontendLogPath, "utf-8");
    }
  } catch (err) {
    console.error("Failed to read frontend logs:", err);
  }
  return "";
}
