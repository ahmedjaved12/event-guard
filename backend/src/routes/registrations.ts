// routes/registrations.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

// 📌 Organizer: list registrations for events they created
router.get(
  "/organizer",
  authMiddleware,
  requireRole("ORGANIZER"),
  async (req: AuthRequest, res) => {
    try {
      const registrations = await prisma.eventRegistration.findMany({
        where: {
          event: {
            organizerId: req.user!.sub, // only events created by this organizer
          },
        },
        include: {
          event: true,
          user: true,
        },
      });
      res.json(registrations);
    } catch (err) {
      console.error("❌ Failed to fetch organizer registrations:", err);
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  }
);

router.get(
  "/participant",
  authMiddleware,
  requireRole("PARTICIPANT"),
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.sub; // user ID from JWT

      const registrations = await prisma.eventRegistration.findMany({
        where: { userId },
        include: {
          event: true, // include event details
        },
      });

      res.json(registrations);
    } catch (err) {
      console.error("❌ Failed to fetch participant registrations:", err);
      res
        .status(500)
        .json({ error: "Failed to fetch participant registrations" });
    }
  }
);

export default router;
