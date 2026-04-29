import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { apiSuccess, apiError, parseBody } from "@/lib/api-helpers";
import { logAudit, AuditActions, requestMeta } from "@/lib/audit";
import { sendEmail, otpEmail } from "@/lib/email";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const parsed = await parseBody(request, signupSchema);
    if (parsed.error) return parsed.error;
    const { email, password, fullName, phoneNumber } = parsed.data;

    const normalizedEmail = email.toLowerCase().trim();

    // Check email uniqueness
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return apiError("CONFLICT", "An account with this email already exists", 409);
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Find default tenant (first active tenant for MVP)
    const defaultTenant = await db.tenant.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
    });

    if (!defaultTenant) {
      return apiError("INTERNAL_ERROR", "No active tenant found", 500);
    }

    // Create User, UserProfile, and UserGamificationState in a transaction
    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          fullName,
          phoneNumber: phoneNumber ?? null,
          hashedPassword,
          tenantId: defaultTenant.id,
        },
      });

      await tx.userProfile.create({
        data: {
          userId: newUser.id,
        },
      });

      await tx.userGamificationState.create({
        data: {
          userId: newUser.id,
        },
      });

      return newUser;
    });

    logAudit({
      actorUserId: user.id,
      action: AuditActions.USER_SIGNUP,
      targetType: "User",
      targetId: user.id,
      payload: { email: normalizedEmail },
      ...requestMeta(request),
    });

    // Generate 6-digit OTP and send via email
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await db.emailOtp.deleteMany({ where: { email: normalizedEmail } });
    await db.emailOtp.create({
      data: {
        email: normalizedEmail,
        code: otpCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    const otpTemplate = otpEmail(fullName, otpCode);
    await sendEmail({ ...otpTemplate, to: normalizedEmail });

    return apiSuccess({ userId: user.id, email: user.email }, 201);
  } catch (error) {
    console.error("Error during signup:", error);
    return apiError("INTERNAL_ERROR", "Failed to create account", 500);
  }
}
