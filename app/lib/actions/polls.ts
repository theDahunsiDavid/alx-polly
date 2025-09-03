"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

export async function createPoll(formData: FormData) {
  // Opt out of Next.js caching for this request (per Supabase Next.js guide)
  cookies()
  const supabase = await createSupabaseServerClient()

  const title = String(formData.get("title") || "").trim()
  const description = String(formData.get("description") || "").trim() || null
  const allowMultipleVotes = formData.get("allowMultipleVotes") === "on"
  const expiresAtRaw = String(formData.get("expiresAt") || "").trim()
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw).toISOString() : null
  const rawOptions = formData.getAll("options[]").map(v => String(v).trim()).filter(v => v.length > 0)

  if (!title) {
    throw new Error("Title is required")
  }
  if (rawOptions.length < 2) {
    throw new Error("At least two options are required")
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/login")
  }

  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .insert({
      title,
      description,
      created_by: user.id,
      is_active: true,
      allow_multiple_votes: allowMultipleVotes,
      expires_at: expiresAt,
    })
    .select("id")
    .single()

  if (pollError) {
    throw new Error(pollError.message)
  }

  const optionRows = rawOptions.map(text => ({ poll_id: poll.id, text }))
  const { error: optionsError } = await supabase
    .from("poll_options")
    .insert(optionRows)

  if (optionsError) {
    throw new Error(optionsError.message)
  }

  revalidatePath("/polls")
  redirect(`/polls?created=1`)
}

export async function deletePoll(formData: FormData) {
  "use server"
  const supabase = await createSupabaseServerClient()
  const pollId = String(formData.get("pollId") || "")
  if (!pollId) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }
  const { error } = await supabase
    .from("polls")
    .delete()
    .eq("id", pollId)
    .eq("created_by", user!.id)
  if (error) {
    throw new Error(error.message)
  }
  revalidatePath("/dashboard")
}

export async function togglePollActive(formData: FormData) {
  "use server"
  const supabase = await createSupabaseServerClient()
  const pollId = String(formData.get("pollId") || "")
  const nextActive = String(formData.get("nextActive") || "true") === "true"
  if (!pollId) return
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }
  const { error } = await supabase
    .from("polls")
    .update({ is_active: nextActive })
    .eq("id", pollId)
    .eq("created_by", user!.id)
  if (error) {
    throw new Error(error.message)
  }
  revalidatePath(`/polls/${pollId}`)
  revalidatePath("/dashboard")
}

export async function updatePoll(formData: FormData) {
  "use server"
  const supabase = await createSupabaseServerClient()
  const pollId = String(formData.get("pollId") || "")
  const title = String(formData.get("title") || "").trim()
  const description = String(formData.get("description") || "").trim() || null
  const allowMultipleVotes = formData.get("allowMultipleVotes") === "on"
  const expiresAtRaw = String(formData.get("expiresAt") || "").trim()
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw).toISOString() : null
  const rawOptions = formData.getAll("options[]").map(v => String(v).trim()).filter(v => v.length > 0)

  if (!pollId || !title) {
    throw new Error("Poll ID and title are required")
  }
  if (rawOptions.length < 2) {
    throw new Error("At least two options are required")
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/login")
  }

  // Update poll
  const { error: pollError } = await supabase
    .from("polls")
    .update({
      title,
      description,
      allow_multiple_votes: allowMultipleVotes,
      expires_at: expiresAt,
    })
    .eq("id", pollId)
    .eq("created_by", user.id)

  if (pollError) {
    throw new Error(pollError.message)
  }

  // Delete existing options and insert new ones
  const { error: deleteError } = await supabase
    .from("poll_options")
    .delete()
    .eq("poll_id", pollId)

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  const optionRows = rawOptions.map(text => ({ poll_id: pollId, text }))
  const { error: optionsError } = await supabase
    .from("poll_options")
    .insert(optionRows)

  if (optionsError) {
    throw new Error(optionsError.message)
  }

  revalidatePath(`/polls/${pollId}`)
  revalidatePath("/dashboard")
}


