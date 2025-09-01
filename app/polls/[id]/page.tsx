import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PollVoteForm } from "@/components/forms/poll-vote-form"
import { PollResults } from "@/components/poll-results"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Poll Details",
  description: "View and vote on this poll",
}

// Mock data - replace with actual data fetching based on ID
const mockPoll = {
  id: "1",
  title: "Team Meeting Preferences",
  description: "What time works best for our weekly team meetings? We want to find a time that works for everyone in the team.",
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
}

export default function PollPage({ params }: { params: { id: string } }) {
  // TODO: Fetch poll data based on params.id
  const poll = mockPoll

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{poll.title}</h2>
          <p className="text-muted-foreground">
            Created by {poll.createdBy} • {new Date(poll.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href="/polls">Back to Polls</Link>
          </Button>
        </div>
      </div>

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
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  poll.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                }`}>
                  {poll.isActive ? 'Active' : 'Closed'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Multiple Votes:</span>
                <span className="text-sm text-muted-foreground">
                  {poll.allowMultipleVotes ? 'Allowed' : 'Not Allowed'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Expires:</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(poll.expiresAt).toLocaleString()}
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
            <PollVoteForm poll={poll} />
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
    </div>
  )
}


