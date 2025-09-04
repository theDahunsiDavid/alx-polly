import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { PollDetailClient } from "@/components/poll-detail-client";
import { getUserVotes } from "@/lib/actions/polls";

export const metadata: Metadata = {
  title: "Poll Details",
  description: "View and vote on this poll",
};

// Mock data - replace with actual data fetching based on ID
const mockPoll = {
  id: "1",
  title: "Team Meeting Preferences",
  description:
    "What time works best for our weekly team meetings? We want to find a time that works for everyone in the team.",
  options: [
    { id: "1", text: "Monday 9:00 AM", pollId: "1", voteCount: 8 },
    { id: "2", text: "Monday 2:00 PM", pollId: "1", voteCount: 12 },
    { id: "3", text: "Tuesday 10:00 AM", pollId: "1", voteCount: 15 },
    { id: "4", text: "Wednesday 3:00 PM", pollId: "1", voteCount: 6 },
  ],
  isActive: true,
  expiresAt: new Date("2024-02-15T23:59:59"),
  createdBy: "John Doe",
  totalVotes: 41,
  allowMultipleVotes: false,
  createdAt: new Date("2024-01-15T10:00:00"),
  updatedAt: new Date("2024-01-15T10:00:00"),
};

export default async function PollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data, error }, { data: userData }, userVotes] = await Promise.all([
    supabase
      .from("polls")
      .select(
        `id, title, description, created_by, is_active, allow_multiple_votes, expires_at, created_at, updated_at,
       poll_options:poll_options(id, text, poll_id, vote_count)`,
      )
      .eq("id", id)
      .single(),
    supabase.auth.getUser(),
    getUserVotes(id),
  ]);

  if (error || !data) {
    notFound();
  }

  const totalVotes = (data.poll_options ?? []).reduce(
    (sum: number, o: any) => sum + (o.vote_count ?? 0),
    0,
  );

  const poll = {
    id: data.id,
    title: data.title,
    description: data.description ?? "",
    options: (data.poll_options ?? []).map((o: any) => ({
      id: o.id,
      text: o.text,
      pollId: o.poll_id,
      voteCount: o.vote_count ?? 0,
    })),
    createdBy: data.created_by,
    isActive: data.is_active,
    allowMultipleVotes: data.allow_multiple_votes,
    expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    totalVotes,
  };

  return (
    <PollDetailClient
      poll={poll}
      isOwner={userData?.user?.id === poll.createdBy}
      userVotes={userVotes}
    />
  );
}
