"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Polls", href: "/polls" },
  { name: "Create Poll", href: "/polls/create" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href
              ? "text-black dark:text-white"
              : "text-muted-foreground"
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  )
}

export function AuthNavigation() {
  return (
    <nav className="flex items-center space-x-4">
      <Button variant="outline" asChild>
        <Link href="/login">Sign In</Link>
      </Button>
      <Button asChild>
        <Link href="/register">Sign Up</Link>
      </Button>
    </nav>
  )
}


