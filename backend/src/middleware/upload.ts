import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "./errorHandler";

// ─── Upload Directory ───
const UPLOAD_DIR = path.resolve(__dirname, "../../uploads/cvs");

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ─── Allowed MIME Types ───
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MIME_TO_EXT: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// ─── Multer Storage Config ───
const cvStorage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, UPLOAD_DIR);
  },
  filename: (_req, file, callback) => {
    const ext = MIME_TO_EXT[file.mimetype] || ".bin";
    callback(null, `${uuidv4()}${ext}`);
  },
});

// ─── File Filter ───
const cvFileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new AppError(
        "Invalid file type. Only PDF and Word documents are allowed.",
        400
      )
    );
  }
};

// ─── Multer Upload Instance ───
export const cvUpload = multer({
  storage: cvStorage,
  fileFilter: cvFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

// ─── Upload Directory Path (for static serving) ───
export const UPLOADS_BASE_PATH = path.resolve(__dirname, "../../uploads");
