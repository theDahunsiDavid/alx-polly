import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Create Polls, Gather{" "}
          <span className="text-primary">Opinions</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Build engaging polls, collect valuable feedback, and make data-driven decisions with our intuitive polling platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/polls/create">Create Your First Poll</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/polls">Browse Polls</Link>
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid gap-6 md:grid-cols-3 py-12">
        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M12 2v20M2 12h20" />
              </svg>
            </div>
            <CardTitle>Easy Poll Creation</CardTitle>
            <CardDescription>
              Create polls in minutes with our intuitive interface. Add multiple options, set expiration dates, and customize settings.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z" />
                <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z" />
                <path d="M12 3c0 1-1 2-2 2s-2 1-2 2 1 2 2 2 2 1 2 2 1-2 2-2 2-1 2-2-1-2-2-2-2-1-2-2z" />
              </svg>
            </div>
            <CardTitle>Real-time Results</CardTitle>
            <CardDescription>
              Watch votes come in live with beautiful charts and analytics. Get instant insights into what your audience thinks.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="m22 21-2-2-2-2" />
                <path d="M16 16h6" />
              </svg>
            </div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Secure authentication, user profiles, and the ability to manage your own polls with full control over settings.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="text-center py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
            <CardDescription>
              Join thousands of users who are already creating engaging polls and gathering valuable insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">Sign Up Free</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required • Start creating polls in seconds
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
