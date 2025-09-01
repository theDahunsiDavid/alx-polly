"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Poll, PollOption } from "@/types"

interface PollVoteFormProps {
  poll: Poll
}

export function PollVoteForm({ poll }: PollVoteFormProps) {
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const handleOptionChange = (optionId: string) => {
    if (poll.allowMultipleVotes) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      )
    } else {
      setSelectedOptions([optionId])
    }
  }

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    if (selectedOptions.length === 0) return

    setIsLoading(true)
    
    // TODO: Implement vote submission logic
    setTimeout(() => {
      setIsLoading(false)
      // TODO: Show success message and refresh results
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cast Your Vote</CardTitle>
        <CardDescription>
          {poll.allowMultipleVotes 
            ? "Select one or more options (you can choose multiple)"
            : "Select one option"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {poll.options.map((option) => (
              <div key={option.id} className="flex items-center space-x-3">
                <input
                  type={poll.allowMultipleVotes ? "checkbox" : "radio"}
                  id={`option-${option.id}`}
                  name="poll-option"
                  value={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onChange={() => handleOptionChange(option.id)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  disabled={isLoading}
                />
                <label
                  htmlFor={`option-${option.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                >
                  {option.text}
                </label>
              </div>
            ))}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || selectedOptions.length === 0}
          >
            {isLoading && (
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            Submit Vote
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


