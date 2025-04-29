import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message, userKeywords, fileIds } = await request.json()

    // Fetch file contents if fileIds are provided
    let fileContents = ""
    if (fileIds && fileIds.length > 0) {
      const { data: files } = await supabase
        .from("files")
        .select("file_content")
        .in("id", fileIds)
        .eq("user_id", session.user.id)

      if (files && files.length > 0) {
        fileContents = files.map((file) => file.file_content).join("\n\n")
      }
    }

    // Create system prompt with personalization
    let systemPrompt = "You are a helpful AI assistant."

    if (userKeywords && userKeywords.length > 0) {
      systemPrompt += ` The user seems interested in: ${userKeywords.join(", ")}.`
    }

    if (fileContents) {
      systemPrompt += " Here is additional context from files the user has uploaded:\n\n" + fileContents
    }

    // Generate AI response
    const { text: response } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: message,
    })

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
