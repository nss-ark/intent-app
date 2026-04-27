import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withAuth,
  type AuthSession,
} from "@/lib/api-helpers";

export const GET = withAuth(
  async (_request: NextRequest, _context, session: AuthSession) => {
    try {
      const memberships = await db.matchGroupMember.findMany({
        where: { userId: session.user.id },
        include: {
          matchGroup: {
            include: {
              survey: {
                select: {
                  id: true,
                  title: true,
                  theme: true,
                },
              },
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      fullName: true,
                      photoUrl: true,
                      program: true,
                      graduationYear: true,
                    },
                  },
                },
              },
              meetup: true,
            },
          },
        },
      });

      const data = memberships.map((m) => m.matchGroup);

      return apiSuccess(data);
    } catch (error) {
      console.error("Error listing match groups:", error);
      return apiError("INTERNAL_ERROR", "Failed to list match groups", 500);
    }
  }
);
