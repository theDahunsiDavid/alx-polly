import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Hero Section */}
      <div className="text-center space-y-8 py-16">
        <div className="relative">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900">
            Create Polls, Gather{" "}
            <span className="block text-primary">Opinions</span>
          </h1>
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-3xl opacity-30 -z-10"></div>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Build engaging polls, collect valuable feedback, and make data-driven decisions with our intuitive polling platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="gradient-primary">
            <Link href="/polls/create">Create Your First Poll</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/polls">Browse Polls</Link>
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid gap-8 md:grid-cols-3 py-16">
        <Card className="group hover:scale-105 transition-transform duration-300">
          <CardHeader>
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-white"
              >
                <path d="M12 2v20M2 12h20" />
              </svg>
            </div>
            <CardTitle className="text-gray-900">Easy Poll Creation</CardTitle>
            <CardDescription className="text-gray-600">
              Create polls in minutes with our intuitive interface. Add multiple options, set expiration dates, and customize settings.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="group hover:scale-105 transition-transform duration-300">
          <CardHeader>
            <div className="w-16 h-16 gradient-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-white"
              >
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z" />
                <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z" />
                <path d="M12 3c0 1-1 2-2 2s-2 1-2 2 1 2 2 2 2 1 2 2 1-2 2-2 2-1 2-2-1-2-2-2-2-1-2-2z" />
              </svg>
            </div>
            <CardTitle className="text-gray-900">Real-time Results</CardTitle>
            <CardDescription className="text-gray-600">
              Watch votes come in live with beautiful charts and analytics. Get instant insights into what your audience thinks.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="group hover:scale-105 transition-transform duration-300">
          <CardHeader>
            <div className="w-16 h-16 gradient-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-white"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="m22 21-2-2-2-2" />
                <path d="M16 16h6" />
              </svg>
            </div>
            <CardTitle className="text-gray-900">User Management</CardTitle>
            <CardDescription className="text-gray-600">
              Secure authentication, user profiles, and the ability to manage your own polls with full control over settings.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="text-center py-16">
        <Card className="max-w-2xl mx-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5"></div>
          <CardHeader className="relative">
            <CardTitle className="text-3xl text-gray-900">
              Ready to Get Started?
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Join thousands of users who are already creating engaging polls and gathering valuable insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gradient-primary">
                <Link href="/register">Sign Up Free</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              No credit card required • Start creating polls in seconds
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
