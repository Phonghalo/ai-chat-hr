export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          email: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          avatar_url?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          user_id: string
          role: "user" | "ai"
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: "user" | "ai"
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: "user" | "ai"
          content?: string
          created_at?: string
        }
      }
      files: {
        Row: {
          id: string
          user_id: string
          filename: string
          file_content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          file_content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          file_content?: string
          created_at?: string
        }
      }
    }
  }
}
