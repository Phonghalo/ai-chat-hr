import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // Check if user is authenticated using getUser
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message, userKeywords, fileIds, hasAttachment } = await request.json()

    // Ensure user exists in the database
    const { data: existingUser, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

    // If user doesn't exist, create them
    if (userError && userError.code === "PGRST116") {
      await supabase.from("users").insert({
        id: user.id,
        email: user.email!,
        name: user.user_metadata.full_name || user.email!.split("@")[0],
        avatar_url: user.user_metadata.avatar_url,
        created_at: new Date().toISOString(),
      })
    }

    // Create user message
    const userMessage = {
      id: crypto.randomUUID(),
      user_id: user.id,
      role: "user",
      content: message || (hasAttachment ? "I've attached a file for analysis." : ""),
      created_at: new Date().toISOString(),
    }

    // Save user message to database
    const { data: savedUserMessage, error: messageError } = await supabase
      .from("messages")
      .insert(userMessage)
      .select()
      .single()

    if (messageError) {
      console.error("Error saving user message:", messageError)
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
    }

    // Fetch file contents if fileIds are provided
    let fileContents = []
    if (fileIds && fileIds.length > 0) {
      const { data: files } = await supabase
        .from("files")
        .select("filename, file_content")
        .in("id", fileIds)
        .eq("user_id", user.id)

      if (files && files.length > 0) {
        fileContents = files.map((file) => {
          try {
            const parsedContent = JSON.parse(file.file_content)
            return {
              filename: file.filename,
              content: parsedContent.content,
              analysis: parsedContent.analysis,
            }
          } catch (e) {
            return {
              filename: file.filename,
              content: file.file_content,
              analysis: "No analysis available",
            }
          }
        })
      }
    }

    // Create system prompt with personalization
    let systemPrompt =
      "You are a helpful AI assistant that provides detailed, accurate responses. Format code blocks with proper syntax highlighting using ```language code```  accurate responses. Format code blocks with proper syntax highlighting using ```language code```. When analyzing files, provide insights about the content and structure."

    if (userKeywords && userKeywords.length > 0) {
      systemPrompt += ` The user seems interested in: ${userKeywords.join(", ")}.`
    }

    if (fileContents.length > 0) {
      systemPrompt += " Here is additional context from files the user has uploaded:\n\n"
      fileContents.forEach((file) => {
        systemPrompt += `File: ${file.filename}\n`
        systemPrompt += `Content: ${typeof file.content === "string" ? file.content.substring(0, 500) : JSON.stringify(file.content).substring(0, 500)}${file.content.length > 500 ? "... (truncated)" : ""}\n`
        systemPrompt += `Analysis: ${file.analysis}\n\n`
      })
    }

    // Generate AI response
    const { text: response } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: message || (hasAttachment ? "I've attached a file for analysis. Can you tell me about it?" : ""),

    })

    // Create AI message
    const aiMessage = {
      id: crypto.randomUUID(),
      user_id: user.id,
      role: "ai",
      content: response,
      created_at: new Date().toISOString(),
    }

    // Save AI message to database
    const { data: savedAiMessage, error: aiMessageError } = await supabase
      .from("messages")
      .insert(aiMessage)
      .select()
      .single()

    if (aiMessageError) {
      console.error("Error saving AI message:", aiMessageError)
      return NextResponse.json({ error: "Failed to save AI response" }, { status: 500 })
    }

    return NextResponse.json({
      userMessage: savedUserMessage,
      aiMessage: savedAiMessage,
    })
  } catch (error) {
    console.error("Error in messages API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
