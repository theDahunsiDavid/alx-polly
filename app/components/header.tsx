"use client";

import Link from "next/link";
import { Navigation } from "./navigation";
import { Button } from "./ui/button";
import { useAuth } from "../hooks/use-auth";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export function Header() {
  const { session, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 shadow-modern">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-white"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 0 0 3 3V6a3 3 0 0 0-3-3Z" />
                <path d="M9 6v12a3 3 0 0 1-3-3H6a3 3 0 0 1 3-3V6a3 3 0 0 1-3 3Z" />
              </svg>
            </div>
            <span className="hidden font-bold text-xl text-gray-900 sm:inline-block">
              ALX Polling
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {session && <Navigation />}
          
          {!session && !loading && (
            <Link href="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          )}
          {session && (
            <>
              <Button variant="outline" size="sm">
                Profile
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


