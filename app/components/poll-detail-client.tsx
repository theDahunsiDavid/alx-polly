"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PollVoteForm } from "@/components/forms/poll-vote-form";
import { PollResults } from "@/components/poll-results";
import { EditPollForm } from "@/components/forms/edit-poll-form";
import {
  deletePoll,
  togglePollActive,
  debugVoteState,
  recalculateVoteCounts,
  clearAllVotesForPoll,
  fixVoteConstraintIssue,
} from "@/lib/actions/polls";

import { Poll } from "@/types";
import Link from "next/link";

interface PollDetailClientProps {
  poll: Poll;
  isOwner: boolean;
  userVotes: string[];
}

export function PollDetailClient({
  poll,
  isOwner,
  userVotes,
}: PollDetailClientProps) {
  const [isEditing, setIsEditing] = React.useState(false);

  const handleDebug = async () => {
    const result = await debugVoteState(poll.id);
    console.log("Debug result:", result);
  };

  const handleRecalculate = async () => {
    await recalculateVoteCounts(poll.id);
    window.location.reload();
  };

  const handleClearVotes = async () => {
    if (confirm("Are you sure you want to clear all votes for this poll?")) {
      try {
        await clearAllVotesForPoll(poll.id);
        window.location.reload();
      } catch (error) {
        alert("Error: " + (error as Error).message);
      }
    }
  };

  const handleFixDatabase = async () => {
    if (
      confirm(
        "This will clear all votes for this poll to fix the constraint issue. Are you sure?",
      )
    ) {
      try {
        await fixVoteConstraintIssue(poll.id);
        alert("Vote constraint issue fixed! All votes have been cleared.");
        window.location.reload();
      } catch (error) {
        alert("Error: " + (error as Error).message);
      }
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{poll.title}</h2>
          <p className="text-muted-foreground">
            Created by {poll.createdBy} •{" "}
            {new Date(poll.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href="/polls">Back to Polls</Link>
          </Button>
          <Button variant="secondary" onClick={handleDebug}>
            Debug Votes
          </Button>
          <Button variant="secondary" onClick={handleRecalculate}>
            Fix Vote Counts
          </Button>
          <Button variant="secondary" onClick={handleFixDatabase}>
            Fix Database
          </Button>
          {isOwner && (
            <Button variant="destructive" onClick={handleClearVotes}>
              Clear All Votes
            </Button>
          )}
          {isOwner && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel Edit" : "Edit Poll"}
              </Button>
              <form action={togglePollActive}>
                <input type="hidden" name="pollId" value={poll.id} />
                <input
                  type="hidden"
                  name="nextActive"
                  value={(!poll.isActive).toString()}
                />
                <Button variant="outline">
                  {poll.isActive ? "Close Poll" : "Reopen Poll"}
                </Button>
              </form>
              <form action={deletePoll}>
                <input type="hidden" name="pollId" value={poll.id} />
                <Button variant="destructive">Delete</Button>
              </form>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <EditPollForm poll={poll} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Poll Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{poll.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Poll Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      poll.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                    }`}
                  >
                    {poll.isActive ? "Active" : "Closed"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Multiple Votes:</span>
                  <span className="text-sm text-muted-foreground">
                    {poll.allowMultipleVotes ? "Allowed" : "Not Allowed"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Expires:</span>
                  <span className="text-sm text-muted-foreground">
                    {poll.expiresAt
                      ? new Date(poll.expiresAt).toLocaleString()
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Votes:</span>
                  <span className="text-sm font-medium">{poll.totalVotes}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {poll.isActive ? (
              <PollVoteForm poll={poll} userVotes={userVotes} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Poll Closed</CardTitle>
                  <CardDescription>
                    This poll is no longer accepting votes
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            <PollResults poll={poll} />
          </div>
        </div>
      )}
    </div>
  );
}
