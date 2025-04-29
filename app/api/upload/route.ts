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

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // File metadata
    const metadata = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString(),
    }

    // Extract content based on file type
    let content = ""
    let isTextFile = false

    if (
      file.type.startsWith("text/") ||
      file.type === "application/json" ||
      file.type === "application/xml" ||
      file.type === "application/javascript" ||
      file.name.endsWith(".md") ||
      file.name.endsWith(".csv")
    ) {
      try {
        content = await file.text()
        isTextFile = true
      } catch (e) {
        console.error("Could not extract text content:", e)
        content = `[File content could not be extracted: ${file.name}]`
      }
    } else {
      // For binary files, just store a placeholder
      content = `[Binary file: ${file.name}, type: ${file.type}, size: ${file.size} bytes]`
    }

    // Generate a quick analysis of the file
    let analysis = ""

    if (isTextFile && content.length > 0) {
      try {
        // Limit content length for the AI prompt
        const truncatedContent =
          content.length > 8000 ? content.substring(0, 8000) + "... (content truncated)" : content

        const { text } = await generateText({
          model: openai("gpt-4o"),
          system: "You are an AI assistant that analyzes files. Provide a brief summary of what this file contains.",
          prompt: `I've uploaded a file named "${file.name}" of type "${file.type}". Here's the content:
          
${truncatedContent}

Please provide a brief summary of what this file contains. Keep it concise.`,
        })

        analysis = text
      } catch (e) {
        console.error("Error generating file analysis:", e)
        analysis = "Could not generate analysis for this file."
      }
    } else {
      analysis = `This appears to be a binary file of type ${file.type}.`
    }

    return NextResponse.json({
      content,
      metadata,
      analysis,
    })
  } catch (error) {
    console.error("Error in upload API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
