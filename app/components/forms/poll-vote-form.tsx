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
import { Poll, PollOption } from "@/types";
import { submitVote } from "@/lib/actions/polls";
import { useRouter } from "next/navigation";

interface PollVoteFormProps {
  poll: Poll;
  userVotes: string[];
}

export function PollVoteForm({ poll, userVotes }: PollVoteFormProps) {
  const [selectedOptions, setSelectedOptions] =
    React.useState<string[]>(userVotes);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");
  const [success, setSuccess] = React.useState<string>("");
  const router = useRouter();

  const handleOptionChange = (optionId: string) => {
    if (poll.allowMultipleVotes) {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId],
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedOptions.length === 0) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("pollId", poll.id);
      selectedOptions.forEach((optionId) => {
        formData.append("optionId", optionId);
      });

      await submitVote(formData);

      if (userVotes.length > 0) {
        setSuccess("Your vote has been updated successfully!");
      } else {
        setSuccess("Your vote has been submitted successfully!");
      }

      // Refresh the page to show updated results
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit vote");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cast Your Vote</CardTitle>
        <CardDescription>
          {poll.allowMultipleVotes
            ? "Select one or more options (you can choose multiple)"
            : userVotes.length > 0
              ? "You have already voted. Select a different option to change your vote."
              : "Select one option"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 border border-red-300 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 text-sm text-green-800 bg-green-100 border border-green-300 rounded-md">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {poll.options.map((option) => {
              const isCurrentlyVoted = userVotes.includes(option.id);
              return (
                <div key={option.id} className="flex items-center space-x-3">
                  <input
                    type={poll.allowMultipleVotes ? "checkbox" : "radio"}
                    id={`option-${option.id}`}
                    name="poll-option"
                    value={option.id}
                    checked={selectedOptions.includes(option.id)}
                    onChange={() => handleOptionChange(option.id)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor={`option-${option.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 flex items-center gap-2"
                  >
                    {option.text}
                    {isCurrentlyVoted && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        Your current vote
                      </span>
                    )}
                  </label>
                </div>
              );
            })}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || selectedOptions.length === 0}
          >
            {isLoading && (
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {userVotes.length > 0 && !poll.allowMultipleVotes
              ? "Update Vote"
              : "Submit Vote"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
