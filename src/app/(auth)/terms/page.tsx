import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { IntentWordmark } from "@/components/intent-wordmark";

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-[#6B6B66]">
            Last updated: April 2026
          </p>

          <div className="mt-8 space-y-6 text-sm text-[#1A1A1A] leading-relaxed">
            <section>
              <h2 className="text-base font-semibold mb-2">1. Acceptance of Terms</h2>
              <p className="text-[#6B6B66]">
                By accessing or using Intent (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2">2. Eligibility</h2>
              <p className="text-[#6B6B66]">
                Intent is a private community platform for verified members of participating institutions. You must be a current student, alumni, faculty member, or otherwise affiliated with a participating institution to use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2">3. User Accounts</h2>
              <p className="text-[#6B6B66]">
                You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate and complete information during registration and to keep your profile information up to date.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2">4. Acceptable Use</h2>
              <p className="text-[#6B6B66]">
                You agree not to use the Platform to harass, abuse, or harm other members; post misleading or fraudulent information; spam or solicit other members without their consent; or violate any applicable laws or regulations.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2">5. Content</h2>
              <p className="text-[#6B6B66]">
                You retain ownership of content you post on the Platform. By posting content, you grant Intent a non-exclusive license to display and distribute that content within the Platform for the purpose of operating the service.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2">6. Privacy</h2>
              <p className="text-[#6B6B66]">
                Your use of the Platform is also governed by our{" "}
                <Link href="/privacy" className="text-[#1B3A5F] hover:underline font-medium">
                  Privacy Policy
                </Link>
                , which describes how we collect, use, and protect your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2">7. Termination</h2>
              <p className="text-[#6B6B66]">
                We may suspend or terminate your account if you violate these terms. You may delete your account at any time from your profile settings, which will remove your data as described in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2">8. Limitation of Liability</h2>
              <p className="text-[#6B6B66]">
                The Platform is provided &ldquo;as is&rdquo; without warranties of any kind. Intent shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2">9. Changes to Terms</h2>
              <p className="text-[#6B6B66]">
                We may update these terms from time to time. Continued use of the Platform after changes constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold mb-2">10. Contact</h2>
              <p className="text-[#6B6B66]">
                For questions about these Terms of Service, please contact us at support@intentapp.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
