import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { deletePoll } from "@/lib/actions/polls";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/login")
  }

  // Fetch only the current user's polls for dashboard metrics and list
  const { data: pollsData, error: pollsError } = await supabase
    .from("polls")
    .select(`
      id, title, description, created_by, is_active, expires_at, created_at,
      options:poll_options (id, vote_count)
    `)
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })

  const userPollIds = (pollsData || []).map(p => p.id)
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  // Count new votes today across the user's polls
  let votesToday = 0
  if (userPollIds.length > 0) {
    const { count } = await supabase
      .from("votes")
      .select("id", { count: "exact", head: true })
      .in("poll_id", userPollIds)
      .gte("created_at", startOfToday.toISOString())
    votesToday = count ?? 0
  }

  // Compute derived metrics
  const totalPolls = pollsData?.length ?? 0
  const nowIso = new Date().toISOString()
  const activePolls = (pollsData || []).filter(p => p.is_active && (!p.expires_at || p.expires_at > nowIso)).length
  const totalVotes = (pollsData || []).reduce((sum, p: any) => sum + (p.options || []).reduce((s: number, o: any) => s + (o.vote_count || 0), 0), 0)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/polls/create">Create Poll</Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="m22 21-2-2-2-2" />
              <path d="M16 16h6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPolls}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePolls}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M9 12l2 2 4-4" />
              <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z" />
              <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z" />
              <path d="M12 3c0 1-1 2-2 2s-2 1-2 2 1 2 2 2 2 1 2 2 1-2 2-2 2-1 2-2-1-2-2-2-2-1-2-2z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVotes}</div>
            <p className="text-xs text-muted-foreground">
              Across all polls
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{votesToday}</div>
            <p className="text-xs text-muted-foreground">
              New votes today
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Polls</CardTitle>
            <CardDescription>
              Your most recent polls and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(pollsData || []).map((p: any) => {
                const optionCount = (p.options || []).length
                const totalVotes = (p.options || []).reduce((s: number, o: any) => s + (o.vote_count || 0), 0)
                const isOwner = p.created_by === user.id
                const isActive = p.is_active && (!p.expires_at || p.expires_at > nowIso)
                return (
                  <div key={p.id} className="flex items-center gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString()} • {isActive ? 'Active' : 'Closed'} • Options: {optionCount} • Votes: {totalVotes}
                      </p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/polls/${p.id}`}>View</Link>
                      </Button>
                      {isOwner && (
                        <>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/polls/${p.id}`}>Edit</Link>
                          </Button>
                          <form action={deletePoll}>
                            <input type="hidden" name="pollId" value={p.id} />
                            <Button variant="destructive" size="sm">Delete</Button>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" asChild>
              <Link href="/polls/create">Create New Poll</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/polls">View All Polls</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/analytics">View Analytics</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
