import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (code) {
      const supabase = createClient()
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.exchangeCodeForSession(code)

      if (sessionError) {
        console.error("Session error:", sessionError)
        return NextResponse.redirect(new URL("/login?error=auth", requestUrl.origin))
      }

      // If we have a user, create or update the user record in our users table
      if (session?.user) {
        // Use the service role client for admin operations
        const adminClient = createClient()

        const { data: existingUser, error: fetchError } = await adminClient
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error fetching user:", fetchError)
        }

        // Only insert if the user doesn't exist
        if (!existingUser) {
          const { error: insertError } = await adminClient.from("users").insert({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.full_name || session.user.email!.split("@")[0],
            avatar_url: session.user.user_metadata.avatar_url,
            created_at: new Date().toISOString(),
          })

          if (insertError) {
            console.error("Error inserting user:", insertError)
            return NextResponse.redirect(new URL("/login?error=database", requestUrl.origin))
          }
        }
      }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL("/chat", requestUrl.origin))
  } catch (error) {
    console.error("Auth callback error:", error)
    return NextResponse.redirect(new URL("/login?error=unknown", requestUrl.origin))
  }
}
