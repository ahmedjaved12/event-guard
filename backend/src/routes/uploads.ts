import { Router, Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = Router();

// ✅ Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../../uploads");
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

// ✅ Upload endpoint
router.post("/", upload.single("image"), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // 👇 Use backend base URL instead of relative path
  const fileUrl = `${process.env.BASE_URL || "http://localhost:5000"}/uploads/${
    req.file.filename
  }`;

  res.json({
    message: "File uploaded successfully",
    url: fileUrl,
  });
});

export default router;
