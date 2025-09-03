// routes/user.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.sub; // 👈 comes from your JWT payload

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        otpVerified: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update profile
router.put("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { name, avatarUrl, isActive, emailNotifications } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(isActive !== undefined && { isActive }),
        ...(emailNotifications !== undefined && { emailNotifications }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        otpVerified: true,
        avatarUrl: true,
        emailNotifications: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
