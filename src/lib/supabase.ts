import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          room_code: string
          created_at: string
          status: 'waiting' | 'collecting' | 'playing' | 'finished'
          created_by: string
        }
        Insert: {
          id?: string
          room_code: string
          created_at?: string
          status?: 'waiting' | 'collecting' | 'playing' | 'finished'
          created_by: string
        }
        Update: {
          id?: string
          room_code?: string
          created_at?: string
          status?: 'waiting' | 'collecting' | 'playing' | 'finished'
          created_by?: string
        }
      }
      players: {
        Row: {
          id: string
          room_id: string
          name: string
          answers: Record<string, any>
          target_player_id: string | null
          clues_used: number
          found_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          name: string
          answers?: Record<string, any>
          target_player_id?: string | null
          clues_used?: number
          found_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          name?: string
          answers?: Record<string, any>
          target_player_id?: string | null
          clues_used?: number
          found_at?: string | null
          created_at?: string
        }
      }
      clues: {
        Row: {
          id: string
          player_id: string
          content: string
          clue_number: number
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          content: string
          clue_number: number
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          content?: string
          clue_number?: number
          created_at?: string
        }
      }
    }
  }
} 