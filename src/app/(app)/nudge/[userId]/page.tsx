import { redirect } from "next/navigation";

export default async function OldNudgePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  redirect(`/matching/nudge/${userId}`);
}
