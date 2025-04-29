import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import ChatInterface from "@/components/chat/chat-interface"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Chat - AI Chat App",
  description: "Chat with our AI assistant",
}

export default async function ChatPage() {
  const supabase = createClient()

  // Use getUser instead of getSession for better security
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  // Fetch user data
  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  // If user data doesn't exist, create it
  if (!userData) {
    const { data: newUserData, error: insertError } = await supabase
      .from("users")
      .insert({
        id: user.id,
        email: user.email!,
        name: user.user_metadata.full_name || user.email!.split("@")[0],
        avatar_url: user.user_metadata.avatar_url,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating user:", insertError)
    }
  }

  // Fetch chat history
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  // Fetch uploaded files
  const { data: files } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <ChatInterface
      initialMessages={messages || []}
      initialFiles={files || []}
      user={
        userData || {
          id: user.id,
          email: user.email!,
          name: user.user_metadata.full_name || user.email!.split("@")[0],
          avatar_url: user.user_metadata.avatar_url,
          created_at: new Date().toISOString(),
        }
      }
    />
  )
}
