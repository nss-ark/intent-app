import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
      { status: 401 }
    );
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: {
          include: {
            domain: true,
          },
        },
        niches: {
          include: {
            niche: true,
          },
          orderBy: { position: "asc" },
        },
        education: true,
        experience: {
          include: {
            company: true,
          },
          orderBy: { isCurrent: "desc" },
        },
        badges: {
          include: {
            tenantBadge: {
              include: {
                template: true,
              },
            },
          },
          where: { isVisible: true },
        },
        openSignals: {
          where: { isOpen: true },
          include: {
            tenantSignal: {
              include: {
                template: true,
              },
            },
          },
        },
        gamificationState: true,
        linkedinLinks: true,
        tenant: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    // Strip hashedPassword from response
    const { hashedPassword: _, ...safeUser } = user;

    return NextResponse.json({ success: true, data: safeUser });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch profile" } },
      { status: 500 }
    );
  }
}
