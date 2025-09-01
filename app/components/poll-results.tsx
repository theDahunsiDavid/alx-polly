"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Poll } from "@/types"

interface PollResultsProps {
  poll: Poll
}

export function PollResults({ poll }: PollResultsProps) {
  const totalVotes = poll.options.reduce((sum, option) => sum + option.voteCount, 0)
  
  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0
    return Math.round((votes / totalVotes) * 100)
  }

  const getBarWidth = (votes: number) => {
    if (totalVotes === 0) return 0
    return Math.max((votes / totalVotes) * 100, 2) // Minimum 2% width for visibility
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Poll Results</CardTitle>
        <CardDescription>
          Current voting results ({totalVotes} total votes)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {poll.options.map((option) => {
            const percentage = getPercentage(option.voteCount)
            const barWidth = getBarWidth(option.voteCount)
            
            return (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{option.text}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">{option.voteCount} votes</span>
                    <span className="font-semibold text-primary">{percentage}%</span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        
        {totalVotes === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12 mx-auto mb-4 opacity-50"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="m22 21-2-2-2-2" />
              <path d="M16 16h6" />
            </svg>
            <p className="text-sm">No votes yet</p>
            <p className="text-xs">Be the first to vote!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


