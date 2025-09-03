import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import authRouter from "./routes/auth";
import eventsRouter from "./routes/events";
import participantsRouter from "./routes/participants";
import adminRouter from "./routes/admin";
import userRouter from "./routes/user";
import uploadsRouter from "./routes/uploads";
import registrationsRouter from "./routes/registrations";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (_req, res) => res.send("Backend is working!"));
app.use("/auth", authRouter);
app.use("/events", eventsRouter);
app.use("/participants", participantsRouter);
app.use("/admin", adminRouter);
app.use("/users", userRouter);
app.use("/uploads", uploadsRouter);
app.use("/registrations", registrationsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
