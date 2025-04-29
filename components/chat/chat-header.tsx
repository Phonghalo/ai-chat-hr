"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Database } from "@/types/supabase"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

type User = Database["public"]["Tables"]["users"]["Row"]

interface ChatHeaderProps {
  user: User
  onSignOut: () => Promise<void>
}

export default function ChatHeader({ user, onSignOut }: ChatHeaderProps) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="border-b dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={user.avatar_url || undefined} alt={user.name || "User"} />
            <AvatarFallback>{user.name?.[0] || user.email[0]}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{user.name || user.email.split("@")[0]}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </Button>
          <Button variant="outline" onClick={onSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}
