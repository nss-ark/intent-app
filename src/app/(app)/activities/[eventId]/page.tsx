import { redirect } from "next/navigation";

export default async function OldEventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  redirect(`/spaces/${eventId}`);
}
