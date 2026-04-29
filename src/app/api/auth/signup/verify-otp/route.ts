import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiSuccess, apiError, parseBody } from "@/lib/api-helpers";
import { sendEmailAsync, welcomeEmail } from "@/lib/email";

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const parsed = await parseBody(request, verifySchema);
    if (parsed.error) return parsed.error;
    const { email, code } = parsed.data;

    const normalizedEmail = email.toLowerCase().trim();

    const otp = await db.emailOtp.findFirst({
      where: {
        email: normalizedEmail,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp || otp.code !== code) {
      return apiError("INVALID_OTP", "Invalid or expired verification code", 400);
    }

    // Mark OTP as verified and update user's email verification status
    await db.$transaction([
      db.emailOtp.update({
        where: { id: otp.id },
        data: { verified: true },
      }),
      db.user.update({
        where: { email: normalizedEmail },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
      }),
    ]);

    // Send welcome email now that email is verified
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      include: { tenant: true },
    });
    if (user) {
      const template = welcomeEmail(user.fullName, user.tenant.displayName);
      sendEmailAsync({ ...template, to: normalizedEmail });
    }

    return apiSuccess({ verified: true });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return apiError("INTERNAL_ERROR", "Failed to verify code", 500);
  }
}
