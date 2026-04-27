import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withAdminAuth,
  type AuthSession,
} from "@/lib/api-helpers";

export const GET = withAdminAuth(
  async (_request: NextRequest, _context, _session: AuthSession) => {
    try {
      const [activeMembers, nudgesSent, meetupsHeld, pendingVerifications] =
        await Promise.all([
          db.user.count({
            where: { deletedAt: null },
          }),
          db.nudge.count(),
          db.meetup.count({
            where: { status: "COMPLETED" },
          }),
          db.verificationRequest.count({
            where: { status: "SUBMITTED" },
          }),
        ]);

      return apiSuccess({
        activeMembers,
        activeMembersChange: 0,
        nudgesSent,
        nudgesSentChange: 0,
        meetupsHeld,
        meetupsHeldChange: 0,
        pendingVerifications,
      });
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      return apiError("INTERNAL_ERROR", "Failed to fetch dashboard metrics", 500);
    }
  }
);
