import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export default async function HomePage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/chat")
  } else {
    redirect("/login")
  }
}
