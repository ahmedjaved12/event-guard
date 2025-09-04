// src/routes/events.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

// Create Event (Admin/Organizer only)
router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN", "ORGANIZER"),
  async (req: AuthRequest, res) => {
    try {
      const {
        title,
        description,
        imageUrl,
        date,
        location,
        entryFee,
        maxParticipants,
        tags,
      } = req.body;
      const event = await prisma.event.create({
        data: {
          title,
          description,
          imageUrl,
          date: new Date(date),
          location,
          entryFee: Number(entryFee) || 0,
          maxParticipants: Number(maxParticipants ?? 100),
          tags,
          organizer: {
            connect: { id: req.user!.sub }, // ✅ works now
          },
        },
      });

      res.json(event);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create event" });
    }
  }
);

// Update Event
router.put(
  "/:id",
  authMiddleware,
  requireRole("ADMIN", "ORGANIZER"),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        imageUrl,
        date,
        location,
        entryFee,
        tags,
        status,
      } = req.body;

      // Check ownership if organizer
      const existing = await prisma.event.findUnique({
        where: { id: Number(id) },
      });
      if (!existing) return res.status(404).json({ error: "Event not found" });
      if (
        req.user!.role === "ORGANIZER" &&
        existing.organizerId !== req.user!.sub
      ) {
        return res
          .status(403)
          .json({ error: "You can only update your own events" });
      }

      const updated = await prisma.event.update({
        where: { id: Number(id) },
        data: {
          title,
          description,
          imageUrl,
          date: date ? new Date(date) : existing.date, // 👈 FIX
          location,
          entryFee,
          tags,
          status,
        },
      });

      res.json(updated);
    } catch {
      res.status(500).json({ error: "Failed to update event" });
    }
  }
);

// Delete Event
router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN", "ORGANIZER"),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      const existing = await prisma.event.findUnique({
        where: { id: Number(id) },
      });
      if (!existing) return res.status(404).json({ error: "Event not found" });
      if (
        req.user!.role === "ORGANIZER" &&
        existing.organizerId !== req.user!.sub
      ) {
        return res
          .status(403)
          .json({ error: "You can only delete your own events" });
      }

      await prisma.event.delete({ where: { id: Number(id) } });
      res.json({ message: "Event deleted" });
    } catch {
      res.status(500).json({ error: "Failed to delete event" });
    }
  }
);

// Get Events with Pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: "asc" },
        include: {
          organizer: { select: { id: true, name: true, email: true } },
          registrations: {
            // 👈 include registrations
            select: { userId: true },
          },
        },
      }),
      prisma.event.count(),
    ]);

    res.json({ events, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

router.get(
  "/organizer",
  authMiddleware,
  requireRole("ORGANIZER", "ADMIN"),
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where: { organizerId: req.user.sub },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { date: "asc" },
          include: {
            organizer: { select: { id: true, name: true, email: true } },
            registrations: {
              // 👈 include registrations
              select: { userId: true },
            },
          },
        }),
        prisma.event.count({
          where: { organizerId: req.user.sub },
        }),
      ]);

      res.json({
        events,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (err) {
      console.error("Failed to fetch organizer events:", err);
      res.status(500).json({ error: "Failed to fetch organizer events" });
    }
  }
);

export default router;
