import { Metadata } from "next"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Polls",
  description: "Browse and participate in polls",
}

export default async function PollsPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const { created } = await searchParams
  const supabase = await createSupabaseServerClient()
  const justCreated = Boolean(created)

  const { data: rows } = await supabase
    .from("polls")
    .select(`
      id, title, description, created_by, is_active, expires_at, created_at,
      options:poll_options (id, vote_count)
    `)
    .order("created_at", { ascending: false })

  const polls = (rows || []).map((p: any) => {
    const optionCount = (p.options || []).length
    const totalVotes = (p.options || []).reduce((s: number, o: any) => s + (o.vote_count || 0), 0)
    return {
      id: p.id,
      title: p.title,
      description: p.description || "",
      optionCount,
      totalVotes,
      isActive: p.is_active,
      expiresAt: p.expires_at ? new Date(p.expires_at).toLocaleDateString() : "—",
      createdBy: p.created_by,
    }
  })
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
      
      {justCreated && (
        <div className="rounded-md bg-green-50 text-green-800 border border-green-200 px-3 py-2 text-sm">
          Poll created successfully.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {polls.map((poll) => (
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
      
      {polls.length === 0 && (
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
