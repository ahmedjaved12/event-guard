import { Router, Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = Router();

// ✅ Use /tmp/uploads in production (Vercel), ../uploads in development
const uploadDir =
  process.env.NODE_ENV === "production"
    ? "/tmp/uploads"
    : path.join(__dirname, "../../uploads");

// ✅ Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer storage config
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    // unique filename: timestamp-random-original.ext
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ✅ Upload endpoint - SAME ROUTE AS BEFORE
router.post("/", upload.single("image"), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Use the request host to construct the URL dynamically
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const host = req.get("host") || "localhost:5000";
  const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;

  const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

  res.json({
    message: "File uploaded successfully",
    url: fileUrl,
  });
});

export default router;
