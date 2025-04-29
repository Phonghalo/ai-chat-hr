import type { Database } from "@/types/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { FileIcon, FileTextIcon, ImageIcon, FileSpreadsheetIcon, FileIcon as FilePresentationIcon } from "lucide-react"

type Message = Database["public"]["Tables"]["messages"]["Row"]
type File = Database["public"]["Tables"]["files"]["Row"]
type User = Database["public"]["Tables"]["users"]["Row"]

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
  user: User
  files: File[]
}

export default function ChatMessages({ messages, isLoading, user, files }: ChatMessagesProps) {
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-bold mb-2">Welcome to AI Chat!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Start a conversation with our AI assistant or upload a file to analyze.
        </p>
      </div>
    )
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")) return <ImageIcon className="h-5 w-5" />
    if (["xlsx", "xls", "csv"].includes(extension || "")) return <FileSpreadsheetIcon className="h-5 w-5" />
    if (["pptx", "ppt"].includes(extension || "")) return <FilePresentationIcon className="h-5 w-5" />
    if (["pdf", "doc", "docx", "txt", "md"].includes(extension || "")) return <FileTextIcon className="h-5 w-5" />

    return <FileIcon className="h-5 w-5" />
  }

  const renderFileAttachment = (content: string) => {
    if (content.startsWith("Uploaded file:")) {
      const fileName = content.replace("Uploaded file:", "").trim()
      const file = files.find((f) => f.filename === fileName)

      if (file) {
        return (
          <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center gap-2">
            {getFileIcon(file.filename)}
            <span className="text-sm font-medium">{file.filename}</span>
          </div>
        )
      }
    }
    return null
  }

  const formatMessageContent = (content: string) => {
    // Check if content contains code blocks
    if (content.includes("```")) {
      const parts = content.split(/(```[\s\S]*?```)/g)
      return (
        <>
          {parts.map((part, i) => {
            if (part.startsWith("```") && part.endsWith("```")) {
              // Extract language and code
              const match = part.match(/```(\w*)\n([\s\S]*?)```/)
              const language = match?.[1] || ""
              const code = match?.[2] || ""

              return (
                <div key={i} className="my-2 overflow-x-auto">
                  <div className="bg-gray-800 text-gray-100 rounded-t-md px-4 py-1 text-xs font-mono">
                    {language || "code"}
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-md overflow-x-auto">
                    <code>{code}</code>
                  </pre>
                </div>
              )
            }

            // Handle normal text with line breaks
            return (
              <p key={i} className="whitespace-pre-wrap">
                {part}
              </p>
            )
          })}
        </>
      )
    }

    return <p className="whitespace-pre-wrap">{content}</p>
  }

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <Avatar className="h-8 w-8 mt-1">
              {message.role === "user" ? (
                <>
                  <AvatarImage src={user.avatar_url || undefined} alt={user.name || "User"} />
                  <AvatarFallback>{user.name?.[0] || user.email[0]}</AvatarFallback>
                </>
              ) : (
                <>
                  <AvatarFallback className="bg-purple-600 text-white">AI</AvatarFallback>
                </>
              )}
            </Avatar>
            <div className="max-w-full">
              <div
                className={`rounded-2xl px-4 py-2 ${
                  message.role === "user"
                    ? "bg-blue-500 text-white rounded-tr-none"
                    : "bg-gray-200 dark:bg-gray-700 dark:text-gray-100 rounded-tl-none"
                }`}
              >
                {formatMessageContent(message.content)}
                {message.role === "user" && renderFileAttachment(message.content)}
              </div>
              <p className="text-xs text-gray-500 mt-1 px-2">{format(new Date(message.created_at), "h:mm a")}</p>
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="flex gap-3 max-w-[80%]">
            <Avatar className="h-8 w-8 mt-1">
              <AvatarFallback className="bg-purple-600 text-white">AI</AvatarFallback>
            </Avatar>
            <div>
              <div className="rounded-2xl px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-tl-none">
                <div className="flex space-x-2">
                  <div
                    className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
