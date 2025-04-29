"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  UploadIcon,
  FileIcon,
  XIcon,
  ImageIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  FileIcon as FilePresentationIcon,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useAuth } from "@/context/auth-context"
import type { Database } from "@/types/supabase"

type File = Database["public"]["Tables"]["files"]["Row"]

interface FileUploadProps {
  onFileUploaded: (file: File) => void
  onFileSelected: (file: globalThis.File | null) => void
}

export default function FileUpload({ onFileUploaded, onFileSelected }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      onFileSelected(file)
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="h-5 w-5" />
    if (fileType.includes("spreadsheet") || fileType.includes("csv")) return <FileSpreadsheetIcon className="h-5 w-5" />
    if (fileType.includes("presentation")) return <FilePresentationIcon className="h-5 w-5" />
    if (fileType.startsWith("text/") || fileType.includes("pdf") || fileType.includes("document"))
      return <FileTextIcon className="h-5 w-5" />
    return <FileIcon className="h-5 w-5" />
  }

  const handleUpload = async () => {
    if (!selectedFile || !user) return

    setIsUploading(true)

    try {
      // Upload file to API for parsing
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload file")
      }

      const { content, metadata, analysis } = await response.json()

      // Save file metadata to Supabase
      const { data, error } = await supabase
        .from("files")
        .insert({
          user_id: user.id,
          filename: selectedFile.name,
          file_content: JSON.stringify({
            content: content || `[File: ${selectedFile.name}]`,
            metadata,
            analysis,
          }),
        })
        .select()
        .single()

      if (error) throw error

      onFileUploaded(data)
      setSelectedFile(null)
      onFileSelected(null)
    } catch (error) {
      console.error("Error uploading file:", error)
      // Handle error (e.g., show toast notification)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="mb-4">
      {selectedFile ? (
        <div className="flex items-center gap-2 p-2 border rounded-md mb-2 bg-gray-50 dark:bg-gray-800">
          {getFileIcon(selectedFile.type)}
          <span className="text-sm truncate flex-1">{selectedFile.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              setSelectedFile(null)
              onFileSelected(null)
            }}
          >
            <XIcon className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleUpload} disabled={isUploading} className="bg-blue-500 hover:bg-blue-600">
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      ) : (
        <div className="flex items-center">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <UploadIcon className="h-4 w-4" />
            <span>Upload a file</span>
            <input type="file" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
      )}
    </div>
  )
}
