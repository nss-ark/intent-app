import { redirect } from "next/navigation";

export default async function OldGroupMatchPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  redirect(`/matching/group/${groupId}`);
}
