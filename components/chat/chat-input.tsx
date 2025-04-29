"use client"

import type React from "react"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendIcon, PaperclipIcon } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
  hasAttachment?: boolean
}

export default function ChatInput({ onSendMessage, isLoading, hasAttachment = false }: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if ((message.trim() || hasAttachment) && !isLoading) {
      onSendMessage(message)
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="relative flex-1">
        {hasAttachment && (
          <div className="absolute left-3 bottom-3">
            <PaperclipIcon className="h-5 w-5 text-blue-500" />
          </div>
        )}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={hasAttachment ? "Add a message about your file..." : "Type your message here..."}
          className={`min-h-[60px] resize-none rounded-full px-4 py-3 focus-visible:ring-blue-500 ${
            hasAttachment ? "pl-10" : ""
          }`}
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        size="icon"
        className="rounded-full h-12 w-12 bg-blue-500 hover:bg-blue-600"
        disabled={isLoading || (!message.trim() && !hasAttachment)}
      >
        <SendIcon className="h-5 w-5" />
      </Button>
    </form>
  )
}
