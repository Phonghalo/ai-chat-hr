import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const supabase = createClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user data
    const { data: userData, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

    if (error) {
      console.error("Error fetching user data:", error)
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Error in user API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, avatar_url } = await request.json()

    // Update user data
    const { data: userData, error } = await supabase
      .from("users")
      .update({
        name: name || session.user.user_metadata.full_name || session.user.email!.split("@")[0],
        avatar_url: avatar_url || session.user.user_metadata.avatar_url,
      })
      .eq("id", session.user.id as any)
      .select()
      .single()

    if (error) {
      console.error("Error updating user data:", error)
      return NextResponse.json({ error: "Failed to update user data" }, { status: 500 })
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Error in user API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
