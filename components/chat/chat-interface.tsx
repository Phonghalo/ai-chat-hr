"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import type { Database } from "@/types/supabase"
import { useAuth } from "@/context/auth-context"
import ChatHeader from "./chat-header"
import ChatMessages from "./chat-messages"
import ChatInput from "./chat-input"
import FileUpload from "./file-upload"
import { extractKeywords } from "@/utils/ml-utils"

type Message = Database["public"]["Tables"]["messages"]["Row"]
type File = Database["public"]["Tables"]["files"]["Row"]
type User = Database["public"]["Tables"]["users"]["Row"]

interface ChatInterfaceProps {
  initialMessages: Message[]
  initialFiles: File[]
  user: User
}

export default function ChatInterface({ initialMessages, initialFiles, user }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [files, setFiles] = useState<File[]>(initialFiles)
  const [isLoading, setIsLoading] = useState(false)
  const [userKeywords, setUserKeywords] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { signOut } = useAuth()
  const supabase = createClient()

  // Extract keywords from user messages for personalization
  useEffect(() => {
    const userMessages = messages.filter((msg) => msg.role === "user").map((msg) => msg.content)
    if (userMessages.length > 0) {
      const keywords = extractKeywords(userMessages)
      setUserKeywords(keywords)
    }
  }, [messages])

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim() && !selectedFile) return

    // Optimistic update
    const newUserMessage: Message = {
      id: crypto.randomUUID(),
      user_id: user.id,
      role: "user",
      content: content || (selectedFile ? `Uploaded file: ${selectedFile.name}` : ""),
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, newUserMessage])
    setIsLoading(true)

    try {
      // Use the API route to send the message
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          userKeywords,
          fileIds: files.map((file) => file.id),
          hasAttachment: !!selectedFile,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()

      // Update messages with the saved user message and AI response
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== newUserMessage.id), // Remove optimistic message
        data.userMessage,
        data.aiMessage,
      ])
    } catch (error) {
      console.error("Error sending message:", error)
      // Remove the optimistic message if there was an error
      setMessages((prev) => prev.filter((msg) => msg.id !== newUserMessage.id))
    } finally {
      setIsLoading(false)
      router.refresh()
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      // Parse the file_content JSON
      const fileData = JSON.parse(file.file_content)

      // Create a message for the file upload
      const fileUploadMessage: Message = {
        id: crypto.randomUUID(),
        user_id: user.id,
        role: "user",
        content: `Uploaded file: ${file.filename}`,
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, fileUploadMessage])
      setIsLoading(true)

      // Create AI response analyzing the file
      const aiResponse = await fetch("/api/analyze-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: file.id,
          fileName: file.filename,
          fileContent: fileData,
        }),
      })

      if (!aiResponse.ok) {
        throw new Error("Failed to analyze file")
      }

      const { analysis } = await aiResponse.json()

      // Create AI message with file analysis
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        user_id: user.id,
        role: "ai",
        content: analysis,
        created_at: new Date().toISOString(),
      }

      // Save messages to database
      const { data: savedUserMessage } = await supabase.from("messages").insert(fileUploadMessage).select().single()

      const { data: savedAiMessage } = await supabase.from("messages").insert(aiMessage).select().single()

      // Update messages with saved messages
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== fileUploadMessage.id),
        savedUserMessage || fileUploadMessage,
        savedAiMessage || aiMessage,
      ])

      setFiles((prev) => [file, ...prev])
      router.refresh()
    } catch (error) {
      console.error("Error handling file upload:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <ChatHeader user={user} onSignOut={signOut} />
      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg my-4">
        <div className="flex-1 overflow-y-auto p-4">
          <ChatMessages messages={messages} isLoading={isLoading} user={user} files={files} />
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <FileUpload onFileUploaded={handleFileUpload} onFileSelected={setSelectedFile} />
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} hasAttachment={!!selectedFile} />
        </div>
      </div>
    </div>
  )
}
