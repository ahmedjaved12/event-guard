import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.send("Backend is working!"));
app.use("/auth", authRouter);

app.listen(5000, () => console.log("Backend running on http://localhost:5000"));

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
