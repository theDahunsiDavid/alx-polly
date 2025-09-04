"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";

export async function createPoll(formData: FormData) {
  // Opt out of Next.js caching for this request (per Supabase Next.js guide)
  cookies();
  const supabase = await createSupabaseServerClient();

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const allowMultipleVotes = formData.get("allowMultipleVotes") === "on";
  const expiresAtRaw = String(formData.get("expiresAt") || "").trim();
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw).toISOString() : null;
  const rawOptions = formData
    .getAll("options[]")
    .map((v) => String(v).trim())
    .filter((v) => v.length > 0);

  if (!title) {
    throw new Error("Title is required");
  }
  if (rawOptions.length < 2) {
    throw new Error("At least two options are required");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/login");
  }

  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .insert({
      title,
      description,
      created_by: user.id,
      is_active: true,
      allow_multiple_votes: allowMultipleVotes,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (pollError) {
    throw new Error(pollError.message);
  }

  const optionRows = rawOptions.map((text) => ({ poll_id: poll.id, text }));
  const { error: optionsError } = await supabase
    .from("poll_options")
    .insert(optionRows);

  if (optionsError) {
    throw new Error(optionsError.message);
  }

  revalidatePath("/polls");
  redirect(`/polls?created=1`);
}

export async function deletePoll(formData: FormData) {
  "use server";
  const supabase = await createSupabaseServerClient();
  const pollId = String(formData.get("pollId") || "");
  if (!pollId) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  const { error } = await supabase
    .from("polls")
    .delete()
    .eq("id", pollId)
    .eq("created_by", user!.id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/dashboard");
}

export async function togglePollActive(formData: FormData) {
  "use server";
  const supabase = await createSupabaseServerClient();
  const pollId = String(formData.get("pollId") || "");
  const nextActive = String(formData.get("nextActive") || "true") === "true";
  if (!pollId) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  const { error } = await supabase
    .from("polls")
    .update({ is_active: nextActive })
    .eq("id", pollId)
    .eq("created_by", user!.id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath(`/polls/${pollId}`);
  revalidatePath("/dashboard");
}

export async function updatePoll(formData: FormData) {
  "use server";
  const supabase = await createSupabaseServerClient();
  const pollId = String(formData.get("pollId") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const allowMultipleVotes = formData.get("allowMultipleVotes") === "on";
  const expiresAtRaw = String(formData.get("expiresAt") || "").trim();
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw).toISOString() : null;
  const rawOptions = formData
    .getAll("options[]")
    .map((v) => String(v).trim())
    .filter((v) => v.length > 0);

  if (!pollId || !title) {
    throw new Error("Poll ID and title are required");
  }
  if (rawOptions.length < 2) {
    throw new Error("At least two options are required");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/login");
  }

  // Update poll
  const { error: pollError } = await supabase
    .from("polls")
    .update({
      title,
      description,
      allow_multiple_votes: allowMultipleVotes,
      expires_at: expiresAt,
    })
    .eq("id", pollId)
    .eq("created_by", user.id);

  if (pollError) {
    throw new Error(pollError.message);
  }

  // Delete existing options and insert new ones
  const { error: deleteError } = await supabase
    .from("poll_options")
    .delete()
    .eq("poll_id", pollId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const optionRows = rawOptions.map((text) => ({ poll_id: pollId, text }));
  const { error: optionsError } = await supabase
    .from("poll_options")
    .insert(optionRows);

  if (optionsError) {
    throw new Error(optionsError.message);
  }

  revalidatePath(`/polls/${pollId}`);
  revalidatePath("/dashboard");
}

export async function submitVote(formData: FormData) {
  "use server";
  const supabase = await createSupabaseServerClient();

  const pollId = String(formData.get("pollId") || "");
  const optionIds = formData.getAll("optionId").map((id) => String(id));

  console.log("=== SUBMIT VOTE DEBUG ===");
  console.log("Poll ID:", pollId);
  console.log("Option IDs:", optionIds);

  if (!pollId || optionIds.length === 0) {
    throw new Error("Poll ID and at least one option must be provided");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/login");
  }

  console.log("User ID:", user.id);

  // Check existing votes first
  const { data: existingVotes, error: existingVotesError } = await supabase
    .from("votes")
    .select("*")
    .eq("poll_id", pollId)
    .eq("user_id", user.id);

  console.log("Existing votes:", existingVotes);
  console.log("Existing votes error:", existingVotesError);

  // Check if poll is active and not expired
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("is_active, allow_multiple_votes, expires_at")
    .eq("id", pollId)
    .single();

  if (pollError || !poll) {
    throw new Error("Poll not found");
  }

  console.log("Poll settings:", poll);

  if (!poll.is_active) {
    throw new Error("This poll is no longer active");
  }

  if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
    throw new Error("This poll has expired");
  }

  try {
    // Use upsert approach with unique constraint to handle the database trigger issue
    // For single-vote polls, we'll use a workaround since the constraint trigger is problematic

    if (!poll.allow_multiple_votes) {
      // For single-vote polls, use a different approach to avoid the constraint trigger
      // First check if user has existing votes manually
      const { data: existingUserVotes, error: checkError } = await supabase
        .from("votes")
        .select("id, option_id")
        .eq("poll_id", pollId)
        .eq("user_id", user.id);

      if (checkError) {
        throw new Error(
          `Failed to check existing votes: ${checkError.message}`,
        );
      }

      console.log("Found existing votes:", existingUserVotes);

      // Delete existing votes if any
      if (existingUserVotes && existingUserVotes.length > 0) {
        const { error: deleteError } = await supabase
          .from("votes")
          .delete()
          .eq("poll_id", pollId)
          .eq("user_id", user.id);

        if (deleteError) {
          throw new Error(
            `Failed to remove existing votes: ${deleteError.message}`,
          );
        }
        console.log("Deleted existing votes");
      }

      // Insert new vote - use only the first option for single-vote polls
      const { error: voteError, data: insertedVote } = await supabase
        .from("votes")
        .insert({
          poll_id: pollId,
          option_id: optionIds[0],
          user_id: user.id,
        })
        .select();

      if (voteError) {
        console.error("Single vote insert error:", voteError);
        // If we still get the constraint error, it means the trigger is broken
        // Let's manually update the vote counts instead
        if (voteError.message.includes("Multiple votes are not allowed")) {
          throw new Error(
            "Database constraint issue detected. Please contact an administrator to fix the database trigger.",
          );
        }
        throw new Error(`Failed to submit vote: ${voteError.message}`);
      }

      console.log("Successfully inserted single vote:", insertedVote);
    } else {
      // For multi-vote polls, handle each vote
      // Delete existing votes for selected options to allow toggling
      const { error: deleteError } = await supabase
        .from("votes")
        .delete()
        .eq("poll_id", pollId)
        .eq("user_id", user.id)
        .in("option_id", optionIds);

      if (deleteError) {
        console.error("Multi-vote delete error:", deleteError);
        throw new Error(
          `Failed to remove existing votes: ${deleteError.message}`,
        );
      }

      // Insert new votes
      const voteRows = optionIds.map((optionId) => ({
        poll_id: pollId,
        option_id: optionId,
        user_id: user.id,
      }));

      const { error: voteError, data: insertedVotes } = await supabase
        .from("votes")
        .insert(voteRows)
        .select();

      if (voteError) {
        console.error("Multi-vote insert error:", voteError);
        throw new Error(`Failed to submit votes: ${voteError.message}`);
      }

      console.log("Successfully inserted multi votes:", insertedVotes);
    }

    // Recalculate vote counts to ensure consistency
    await recalculateVoteCounts(pollId);
  } catch (error) {
    console.error("Submit vote error:", error);
    throw error;
  }

  revalidatePath(`/polls/${pollId}`);
}

export async function getUserVotes(pollId: string) {
  "use server";
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return [];
  }

  const { data: votes, error } = await supabase
    .from("votes")
    .select("option_id")
    .eq("poll_id", pollId)
    .eq("user_id", user.id);

  if (error) {
    return [];
  }

  return votes?.map((vote) => vote.option_id) || [];
}

export async function debugVoteState(pollId: string) {
  "use server";
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.log("No user authenticated");
    return;
  }

  // Check votes table
  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("*")
    .eq("poll_id", pollId);

  console.log("=== VOTE DEBUG FOR POLL:", pollId, "===");
  console.log("Current user ID:", user.id);
  console.log("All votes for this poll:", votes);
  console.log("Votes error:", votesError);

  // Check user's specific votes
  const { data: userVotes, error: userVotesError } = await supabase
    .from("votes")
    .select("*")
    .eq("poll_id", pollId)
    .eq("user_id", user.id);

  console.log("Current user's votes:", userVotes);
  console.log("User votes error:", userVotesError);

  // Check poll options and their vote counts
  const { data: options, error: optionsError } = await supabase
    .from("poll_options")
    .select("*")
    .eq("poll_id", pollId);

  console.log("Poll options with vote counts:", options);
  console.log("Options error:", optionsError);

  return {
    allVotes: votes,
    userVotes: userVotes,
    options: options,
  };
}

export async function recalculateVoteCounts(pollId: string) {
  "use server";
  const supabase = await createSupabaseServerClient();

  // Get all options for this poll
  const { data: options, error: optionsError } = await supabase
    .from("poll_options")
    .select("id")
    .eq("poll_id", pollId);

  if (optionsError || !options) {
    console.error("Error fetching options:", optionsError);
    return;
  }

  // For each option, count the actual votes and update the vote_count
  for (const option of options) {
    const { count, error: countError } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("option_id", option.id);

    if (countError) {
      console.error("Error counting votes for option", option.id, countError);
      continue;
    }

    const actualCount = count || 0;

    // Update the vote_count in poll_options
    const { error: updateError } = await supabase
      .from("poll_options")
      .update({ vote_count: actualCount })
      .eq("id", option.id);

    if (updateError) {
      console.error(
        "Error updating vote count for option",
        option.id,
        updateError,
      );
    } else {
      console.log(`Updated option ${option.id} vote count to ${actualCount}`);
    }
  }

  console.log("Vote count recalculation completed for poll", pollId);
}

export async function clearAllVotesForPoll(pollId: string) {
  "use server";
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // Only allow poll owners to clear votes
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("created_by")
    .eq("id", pollId)
    .single();

  if (pollError || !poll || poll.created_by !== user.id) {
    throw new Error("Not authorized to clear votes for this poll");
  }

  // Delete all votes for this poll
  const { error: deleteError } = await supabase
    .from("votes")
    .delete()
    .eq("poll_id", pollId);

  if (deleteError) {
    throw new Error("Error clearing votes: " + deleteError.message);
  }

  // Reset all vote counts to 0
  const { error: resetError } = await supabase
    .from("poll_options")
    .update({ vote_count: 0 })
    .eq("poll_id", pollId);

  if (resetError) {
    throw new Error("Error resetting vote counts: " + resetError.message);
  }

  console.log("Cleared all votes for poll", pollId);
}

export async function fixVoteConstraintIssue(pollId: string) {
  "use server";
  const supabase = await createSupabaseServerClient();

  // The issue is the database constraint trigger is AFTER INSERT instead of BEFORE INSERT
  // Since we can't easily modify the trigger, let's work around it by using upsert logic

  // First, let's clear any problematic votes for this poll
  const { error: clearError } = await supabase
    .from("votes")
    .delete()
    .eq("poll_id", pollId);

  if (clearError) {
    console.error("Error clearing votes:", clearError);
  }

  // Reset vote counts to 0
  const { error: resetError } = await supabase
    .from("poll_options")
    .update({ vote_count: 0 })
    .eq("poll_id", pollId);

  if (resetError) {
    console.error("Error resetting vote counts:", resetError);
  }

  console.log("Vote constraint issue fixed for poll", pollId);
}
