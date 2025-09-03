"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus } from "lucide-react"
import { updatePoll } from "@/lib/actions/polls"
import { Poll } from "@/types"

interface EditPollFormProps {
  poll: Poll
}

export function EditPollForm({ poll }: EditPollFormProps) {
  const [options, setOptions] = React.useState<string[]>(
    poll.options.length > 0 ? poll.options.map(o => o.text) : ["", ""]
  )

  const addOption = () => {
    setOptions([...options, ""])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Poll</CardTitle>
        <CardDescription>
          Update the details of your poll
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updatePoll} className="space-y-6">
          <input type="hidden" name="pollId" value={poll.id} />
          
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Poll Title *
            </label>
            <Input
              id="title"
              name="title"
              placeholder="Enter poll title..."
              defaultValue={poll.title}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe what this poll is about..."
              defaultValue={poll.description || ""}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Poll Options *</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
            
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    required
                    name="options[]"
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="expiresAt" className="text-sm font-medium">
                Expiration Date
              </label>
              <Input
                id="expiresAt"
                type="datetime-local"
                name="expiresAt"
                defaultValue={poll.expiresAt ? new Date(poll.expiresAt).toISOString().slice(0, 16) : ""}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="allowMultipleVotes"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                name="allowMultipleVotes"
                defaultChecked={poll.allowMultipleVotes}
              />
              <label htmlFor="allowMultipleVotes" className="text-sm font-medium">
                Allow multiple votes per user
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4">
            <Button type="submit">
              Update Poll
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
