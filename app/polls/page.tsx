import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Polls",
  description: "Browse and participate in polls",
}

// Mock data - replace with actual data fetching
const mockPolls = [
  {
    id: "1",
    title: "Team Meeting Preferences",
    description: "What time works best for our weekly team meetings?",
    optionCount: 4,
    totalVotes: 23,
    isActive: true,
    expiresAt: "2024-02-15",
    createdBy: "John Doe",
  },
  {
    id: "2",
    title: "Project Timeline Feedback",
    description: "How do you feel about the current project timeline?",
    optionCount: 5,
    totalVotes: 18,
    isActive: true,
    expiresAt: "2024-02-20",
    createdBy: "Jane Smith",
  },
  {
    id: "3",
    title: "Office Lunch Options",
    description: "What should we order for the team lunch next week?",
    optionCount: 6,
    totalVotes: 31,
    isActive: false,
    expiresAt: "2024-02-10",
    createdBy: "Mike Johnson",
  },
  {
    id: "4",
    title: "Remote Work Policy",
    description: "How many days per week should we work from home?",
    optionCount: 4,
    totalVotes: 42,
    isActive: true,
    expiresAt: "2024-02-25",
    createdBy: "Sarah Wilson",
  },
]

export default function PollsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">All Polls</h2>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/polls/create">Create Poll</Link>
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search polls..."
          className="max-w-sm"
        />
        <Button variant="outline">Filter</Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockPolls.map((poll) => (
          <Card key={poll.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{poll.title}</CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  poll.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                }`}>
                  {poll.isActive ? 'Active' : 'Closed'}
                </span>
              </div>
              <CardDescription className="line-clamp-2">
                {poll.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Options: {poll.optionCount}</span>
                  <span>Votes: {poll.totalVotes}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>By: {poll.createdBy}</span>
                  <span>Expires: {poll.expiresAt}</span>
                </div>
                <div className="pt-2">
                  <Button className="w-full" asChild>
                    <Link href={`/polls/${poll.id}`}>
                      {poll.isActive ? 'Vote Now' : 'View Results'}
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {mockPolls.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12 mx-auto mb-4"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="m22 21-2-2-2-2" />
              <path d="M16 16h6" />
            </svg>
            <h3 className="text-lg font-semibold">No polls found</h3>
            <p className="text-sm text-muted-foreground">
              There are no polls available at the moment.
            </p>
          </div>
          <Button asChild>
            <Link href="/polls/create">Create the first poll</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
