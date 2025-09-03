import { Router } from "express";
import { prisma } from "../prisma";
import { hashPassword, verifyPassword, signAccessToken } from "../utils/auth";
import { generateOtp, hashOtp, verifyOtp, expiryDate } from "../utils/otp";
import { sendOtpEmail } from "../utils/email";
import { differenceInSeconds } from "date-fns";

const router = Router();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function sanitizeUser(u: any) {
  const { passwordHash, ...rest } = u;
  return rest;
}

/**
 * POST /auth/register
 * body: { name, email, password }
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!email || !password || !name)
      return res
        .status(400)
        .json({ error: "Name, email and password required" });
    const e = normalizeEmail(email);

    const existing = await prisma.user.findUnique({ where: { email: e } });
    if (existing)
      return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email: e,
        passwordHash,
        role: role || "PARTICIPANT",
      },
    });

    const token = signAccessToken({
      sub: user.id,
      role: user.role,
      avatarUrl: user.avatarUrl,
      name: user.name,
    });
    res.status(201).json({ user: sanitizeUser(user), token });
  } catch (err) {
    console.error("register:", err);
    res.status(500).json({ error: "registration failed" });
  }
});

/**
 * POST /auth/login
 * body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "email & password required" });

    const e = normalizeEmail(email);

    const user = await prisma.user.findUnique({ where: { email: e } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    // ✅ Require OTP verification before login
    if (!user.otpVerified) {
      return res.status(403).json({
        error: "Email not verified. Please verify OTP before logging in.",
      });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const token = signAccessToken({
      sub: user.id,
      role: user.role,
      avatarUrl: user.avatarUrl,
      name: user.name,
    });
    res.json({ user: sanitizeUser(user), token });
  } catch (err) {
    console.error("login:", err);
    res.status(500).json({ error: "login failed" });
  }
});

/**
 * POST /auth/otp/request
 * body: { email, purpose }  // purpose: "SIGNUP" | "LOGIN"
 * - Sends an OTP email.
 */
router.post("/otp/request", async (req, res) => {
  try {
    const { email, purpose } = req.body || {};
    if (!email || !purpose)
      return res.status(400).json({ error: "email & purpose required" });
    if (!["SIGNUP", "LOGIN"].includes(purpose)) {
      return res.status(400).json({ error: "invalid purpose" });
    }
    const e = normalizeEmail(email);

    // if LOGIN, ensure user exists
    if (purpose === "LOGIN") {
      const exists = await prisma.user.findUnique({ where: { email: e } });
      if (!exists) return res.status(404).json({ error: "user not found" });
    }

    // One active OTP at a time
    await prisma.otpCode.updateMany({
      where: { email: e, purpose, used: false },
      data: { used: true },
    });

    const code = generateOtp();
    const codeHash = await hashOtp(code);

    await prisma.otpCode.create({
      data: { email: e, codeHash, purpose, expiresAt: expiryDate() },
    });

    await sendOtpEmail(e, code, purpose);

    res.json({ ok: true, message: "OTP sent" });
  } catch (err) {
    console.error("otp/request:", err);
    res.status(500).json({ error: "failed to send OTP" });
  }
});

router.get("/otp/status", async (req, res) => {
  try {
    const { email, purpose } = req.query || {};
    if (!email || !purpose)
      return res.status(400).json({ error: "email & purpose required" });

    // ✅ Only allow LOGIN or SIGNUP
    if (!["SIGNUP", "LOGIN"].includes(purpose as string)) {
      return res.status(400).json({ error: "invalid purpose" });
    }

    const otp = await prisma.otpCode.findFirst({
      where: {
        email: email as string,
        purpose: purpose as "SIGNUP" | "LOGIN",
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return res.status(404).json({ error: "No active OTP found" });
    }

    const now = new Date();
    const remainingSeconds = differenceInSeconds(otp.expiresAt, now);

    res.json({
      expiresAt: otp.expiresAt,
      remainingSeconds: remainingSeconds > 0 ? remainingSeconds : 0,
    });
  } catch (err) {
    console.error("otp/status:", err);
    res.status(500).json({ error: "Failed to fetch OTP status" });
  }
});

/**
 * POST /auth/otp/verify
 * body: { email, purpose, code, name? }
 * - If SIGNUP and user not exists -> create user w/o password.
 * - If LOGIN -> issue JWT.
 */
router.post("/otp/verify", async (req, res) => {
  try {
    const { email, purpose, code } = req.body || {};
    if (!email || !purpose || !code) {
      return res.status(400).json({ error: "email, purpose, code required" });
    }
    if (!["SIGNUP", "LOGIN"].includes(purpose)) {
      return res.status(400).json({ error: "invalid purpose" });
    }

    const e = normalizeEmail(email);

    const otp = await prisma.otpCode.findFirst({
      where: { email: e, purpose, used: false },
      orderBy: { createdAt: "desc" },
    });
    if (!otp) return res.status(400).json({ error: "no active OTP" });
    if (otp.expiresAt < new Date())
      return res.status(400).json({ error: "OTP expired" });

    const ok = await verifyOtp(code, otp.codeHash);
    if (!ok) return res.status(400).json({ error: "invalid OTP" });

    // ✅ mark OTP as used
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    });

    // ✅ update user and set otpVerified = true
    let user = await prisma.user.findUnique({ where: { email: e } });
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    user = await prisma.user.update({
      where: { id: user.id },
      data: { otpVerified: true },
    });

    // ✅ issue token
    const token = signAccessToken({
      sub: user.id,
      role: user.role,
      avatarUrl: user.avatarUrl,
      name: user.name,
    });
    res.json({ user: sanitizeUser(user), token });
  } catch (err) {
    console.error("otp/verify:", err);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

/**
 * POST /auth/password/reset/request
 * body: { email }
 * - Sends RESET OTP.
 */
router.post("/password/reset/request", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "email required" });
    const e = normalizeEmail(email);

    const user = await prisma.user.findUnique({ where: { email: e } });
    if (!user) return res.status(404).json({ error: "user not found" });

    await prisma.otpCode.updateMany({
      where: { email: e, purpose: "RESET", used: false },
      data: { used: true },
    });

    const code = generateOtp();
    const codeHash = await hashOtp(code);

    await prisma.otpCode.create({
      data: { email: e, codeHash, purpose: "RESET", expiresAt: expiryDate() },
    });

    await sendOtpEmail(e, code, "password reset");

    res.json({ ok: true, message: "Reset OTP sent" });
  } catch (err) {
    console.error("password/reset/request:", err);
    res.status(500).json({ error: "failed to send reset OTP" });
  }
});

/**
 * POST /auth/password/reset/confirm
 * body: { email, code, newPassword }
 * - Verifies RESET OTP and updates passwordHash.
 */
router.post("/password/reset/confirm", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body || {};
    if (!email || !code || !newPassword) {
      return res
        .status(400)
        .json({ error: "email, code, newPassword required" });
    }
    const e = normalizeEmail(email);

    const user = await prisma.user.findUnique({ where: { email: e } });
    if (!user) return res.status(404).json({ error: "user not found" });

    const otp = await prisma.otpCode.findFirst({
      where: { email: e, purpose: "RESET", used: false },
      orderBy: { createdAt: "desc" },
    });
    if (!otp) return res.status(400).json({ error: "no active reset OTP" });
    if (otp.expiresAt < new Date())
      return res.status(400).json({ error: "OTP expired" });

    const ok = await verifyOtp(code, otp.codeHash);
    if (!ok) return res.status(400).json({ error: "invalid OTP" });

    // mark used and update password
    await prisma.$transaction([
      prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } }),
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await hashPassword(newPassword) },
      }),
    ]);

    res.json({ ok: true, message: "Password updated" });
  } catch (err) {
    console.error("password/reset/confirm:", err);
    res.status(500).json({ error: "reset failed" });
  }
});

export default router;
