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
  clearAllVotesForPoll,
} from "@/lib/actions/polls";
import { ArrowLeft, Trash2, Edit3, Play, Pause, X } from "lucide-react";

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
          <Button variant="outline" size="sm" asChild title="Back to Polls">
            <Link href="/polls">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          {isOwner && (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearVotes}
                title="Clear All Votes"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                title={isEditing ? "Cancel Edit" : "Edit Poll"}
              >
                {isEditing ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Edit3 className="h-4 w-4" />
                )}
              </Button>
              <form action={togglePollActive}>
                <input type="hidden" name="pollId" value={poll.id} />
                <input
                  type="hidden"
                  name="nextActive"
                  value={(!poll.isActive).toString()}
                />
                <Button
                  variant="outline"
                  size="sm"
                  title={poll.isActive ? "Close Poll" : "Reopen Poll"}
                >
                  {poll.isActive ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </form>
              <form action={deletePoll}>
                <input type="hidden" name="pollId" value={poll.id} />
                <Button variant="destructive" size="sm" title="Delete Poll">
                  <X className="h-4 w-4" />
                </Button>
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
