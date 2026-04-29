import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { apiSuccess, apiError, parseBody } from "@/lib/api-helpers";
import { sendEmailAsync, otpEmail } from "@/lib/email";

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const parsed = await parseBody(request, resendSchema);
    if (parsed.error) return parsed.error;
    const { email } = parsed.data;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Don't reveal whether the email exists
      return apiSuccess({ sent: true });
    }

    // Delete old OTPs and create new one
    await db.emailOtp.deleteMany({ where: { email: normalizedEmail } });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await db.emailOtp.create({
      data: {
        email: normalizedEmail,
        code: otpCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const template = otpEmail(user.fullName, otpCode);
    sendEmailAsync({ ...template, to: normalizedEmail });

    return apiSuccess({ sent: true });
  } catch (error) {
    console.error("Error resending OTP:", error);
    return apiError("INTERNAL_ERROR", "Failed to resend code", 500);
  }
}
