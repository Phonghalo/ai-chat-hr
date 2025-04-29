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

    const { fileId, fileName, fileContent } = await request.json()

    // Validate file ownership
    if (fileId) {
      const { data: fileData, error: fileError } = await supabase
        .from("files")
        .select("*")
        .eq("id", fileId)
        .eq("user_id", user.id)
        .single()

      if (fileError || !fileData) {
        return NextResponse.json({ error: "File not found or access denied" }, { status: 404 })
      }
    }

    // Extract content for analysis
    let contentToAnalyze = ""
    let fileType = ""

    if (fileContent) {
      if (fileContent.content) {
        contentToAnalyze =
          typeof fileContent.content === "string" ? fileContent.content : JSON.stringify(fileContent.content)
      }

      if (fileContent.metadata && fileContent.metadata.type) {
        fileType = fileContent.metadata.type
      }
    }

    // Generate analysis using AI
    const { text: analysis } = await generateText({
      model: openai("gpt-4o"),
      system: "You are an AI assistant that analyzes files. Provide a helpful, concise analysis of the file content.",
      prompt: `I've uploaded a file named "${fileName}" of type "${fileType}". Please analyze its content and provide insights.
      
File content:
${contentToAnalyze.substring(0, 8000)}${contentToAnalyze.length > 8000 ? "... (content truncated)" : ""}`,
    })

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Error in analyze-file API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
