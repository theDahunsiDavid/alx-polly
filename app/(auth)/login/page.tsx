import { Metadata } from "next"
import { LoginForm } from "@/components/forms/login-form"

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
}

export default function LoginPage() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col p-10 text-white lg:flex">
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-secondary/80 to-accent/70" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 0 0 3 3V6a3 3 0 0 0-3-3Z" />
              <path d="M9 6v12a3 3 0 0 1-3-3H6a3 3 0 0 1 3-3V6a3 3 0 0 1-3 3Z" />
            </svg>
          </div>
          ALX Polling App
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-4">
            <p className="text-xl leading-relaxed">
              &ldquo;Create polls, gather opinions, and make data-driven decisions with our intuitive polling platform.&rdquo;
            </p>
            <div className="flex items-center space-x-2 text-sm opacity-80">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Trusted by thousands of users</span>
            </div>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-3 text-center">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome back
            </h1>
            <p className="text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
