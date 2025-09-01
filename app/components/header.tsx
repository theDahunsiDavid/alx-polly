"use client"

import Link from "next/link"
import { Navigation, AuthNavigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export function Header() {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 0 0 3 3V6a3 3 0 0 0-3-3Z" />
              <path d="M9 6v12a3 3 0 0 1-3-3H6a3 3 0 0 1 3-3V6a3 3 0 0 1-3 3Z" />
            </svg>
            <span className="hidden font-bold sm:inline-block">
              ALX Polling
            </span>
          </Link>
        </div>
        
        {!isAuthPage && <Navigation />}
        
        <div className="ml-auto flex items-center space-x-2">
          {isAuthPage ? (
            <AuthNavigation />
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Profile
              </Button>
              <Button variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}


