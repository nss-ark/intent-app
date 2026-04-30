import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { IntentWordmark } from "@/components/intent-wordmark";

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col px-6 py-6 md:py-12">
      <div className="w-full max-w-[640px] mx-auto">
        <Link
          href="/signup"
          className="flex items-center gap-1.5 text-sm text-[#6B6B66] hover:text-[#1A1A1A] transition-colors -ml-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <div className="flex flex-col items-center flex-1 mt-6 md:mt-10">
        <IntentWordmark size="md" />

        <div className="w-full max-w-[640px] mt-8 md:mt-10">
          <h1 className="text-xl md:text-2xl font-heading font-semibold text-[#1A1A1A] tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-[#6B6B66]">
            Last updated: April 2026
          </p>

          <div className="mt-8 space-y-6 text-sm text-[#1A1A1A] leading-relaxed">
            <section>
              <h2 className="text-base font-semibold mb-2">1. Information We Collect</h2>
              <p className="text-[#6B6B66]">
                We collect information you provide when creating your account, including your name, email address, educational background, professional experience, and profile details. We also collect usage data such as how you interact with the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2">2. How We Use Your Information</h2>
              <p className="text-[#6B6B66]">
                We use your information to operate and improve the Platform, match you with relevant community members, personalize your experience, send notifications about activity relevant to you, and ensure the security of your account.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2">3. Profile Visibility</h2>
              <p className="text-[#6B6B66]">
                Your profile information is visible to other verified members of your institution within the Platform. You can control your visibility in the community directory from your profile settings.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2">4. Data Sharing</h2>
              <p className="text-[#6B6B66]">
                We do not sell your personal information to third parties. We may share data with service providers who help us operate the Platform (e.g., email delivery, hosting), subject to strict confidentiality obligations.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2">5. Data Retention</h2>
              <p className="text-[#6B6B66]">
                We retain your data for as long as your account is active. When you delete your account, we remove your personal data within 30 days, except where retention is required by law.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2">6. Your Rights</h2>
              <p className="text-[#6B6B66]">
                You have the right to access, correct, or delete your personal data. You can export your data or request account deletion from your profile settings. You may also withdraw consent for optional data processing at any time.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2">7. Security</h2>
              <p className="text-[#6B6B66]">
                We implement industry-standard security measures to protect your data, including encryption in transit and at rest, secure authentication, and regular security audits.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2">8. Cookies</h2>
              <p className="text-[#6B6B66]">
                We use essential cookies to maintain your session and preferences. We do not use third-party tracking cookies or advertising cookies.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2">9. Changes to This Policy</h2>
              <p className="text-[#6B6B66]">
                We may update this Privacy Policy from time to time. We will notify you of significant changes via email or in-app notification.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2">10. Contact</h2>
              <p className="text-[#6B6B66]">
                For questions about this Privacy Policy or to exercise your data rights, please contact us at privacy@intentapp.com.
              </p>
            </section>

            <section>
              <p className="text-[#6B6B66]">
                Also see our{" "}
                <Link href="/terms" className="text-[#1B3A5F] hover:underline font-medium">
                  Terms of Service
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
