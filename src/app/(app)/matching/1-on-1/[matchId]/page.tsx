import { redirect } from "next/navigation";

export default async function OldMatchDetailPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  redirect(`/aligned/1-on-1/${matchId}`);
}
