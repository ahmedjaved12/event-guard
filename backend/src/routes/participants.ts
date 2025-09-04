// src/routes/participants.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// ✅ Join Event
router.post("/:eventId/join", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user || req.user.role !== "PARTICIPANT") {
      return res
        .status(403)
        .json({ error: "Only participants can join events" });
    }

    const { eventId } = req.params;
    const event = await prisma.event.findUnique({
      where: { id: Number(eventId) },
      include: { registrations: true },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if event is full
    if (event.registrations.length >= event.maxParticipants) {
      return res.status(400).json({ error: "Event is full" });
    }

    // Create registration (relation is handled automatically)
    const registration = await prisma.eventRegistration.create({
      data: { eventId: event.id, userId: req.user.sub },
    });

    res.json({ message: "Joined event successfully", registration });
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Already joined this event" });
    }
    console.error("Join event error:", err);
    res.status(500).json({ error: "Failed to join event" });
  }
});

// ✅ Leave Event
router.post(
  "/:eventId/leave",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user || req.user.role !== "PARTICIPANT") {
        return res
          .status(403)
          .json({ error: "Only participants can leave events" });
      }

      const { eventId } = req.params;

      await prisma.eventRegistration.delete({
        where: {
          eventId_userId: {
            eventId: Number(eventId),
            userId: req.user.sub,
          },
        },
      });

      res.json({ message: "Left event successfully" });
    } catch (err: any) {
      if (err.code === "P2025") {
        // Nothing to delete
        return res
          .status(400)
          .json({ error: "You are not registered for this event" });
      }
      console.error("Leave event error:", err);
      res.status(500).json({ error: "Failed to leave event" });
    }
  }
);

export default router;
