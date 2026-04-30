import { redirect } from "next/navigation";

export default async function OldMentorshipDetailPage({ params }: { params: Promise<{ mentorshipId: string }> }) {
  const { mentorshipId } = await params;
  redirect(`/aligned/mentorship/${mentorshipId}`);
}
