// src/routes/admin.ts
import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

// 🔹 1. Get all users with pagination
router.get(
  "/users",
  authMiddleware,
  requireRole("ADMIN"),
  async (req: AuthRequest, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count(),
      ]);

      res.json({
        data: users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }
);

// 🔹 2. Get all events with pagination
router.get(
  "/events",
  authMiddleware,
  requireRole("ADMIN"),
  async (req: AuthRequest, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: { organizer: true },
        }),
        prisma.event.count(),
      ]);

      res.json({
        data: events,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  }
);

// 🔹 3. Get all registrations with pagination
router.get(
  "/registrations",
  authMiddleware,
  requireRole("ADMIN"),
  async (req: AuthRequest, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [registrations, total] = await Promise.all([
        prisma.eventRegistration.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: { event: true, user: true },
        }),
        prisma.eventRegistration.count(),
      ]);

      res.json({
        data: registrations,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  }
);

export default router;
