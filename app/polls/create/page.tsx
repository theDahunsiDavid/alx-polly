import { Metadata } from "next"
import { CreatePollForm } from "@/components/forms/create-poll-form"

export const metadata: Metadata = {
  title: "Create Poll",
  description: "Create a new poll to gather opinions and feedback",
}

export default function CreatePollPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create New Poll</h2>
      </div>
      
      <div className="max-w-2xl">
        <CreatePollForm />
      </div>
    </div>
  )
}


