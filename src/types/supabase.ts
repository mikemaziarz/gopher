export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      golf_courses: {
        Row: {
          city: string | null
          course_name: string
          course_rating: number
          created_at: string | null
          id: string
          public_private: string | null
          slope_rating: number
          state: string | null
          tee_name: string
          website: string | null
        }
        Insert: {
          city?: string | null
          course_name: string
          course_rating: number
          created_at?: string | null
          id?: string
          public_private?: string | null
          slope_rating: number
          state?: string | null
          tee_name: string
          website?: string | null
        }
        Update: {
          city?: string | null
          course_name?: string
          course_rating?: number
          created_at?: string | null
          id?: string
          public_private?: string | null
          slope_rating?: number
          state?: string | null
          tee_name?: string
          website?: string | null
        }
        Relationships: []
      }
      round_files: {
        Row: {
          file_url: string
          id: string
          round_id: string | null
          uploaded_at: string | null
        }
        Insert: {
          file_url: string
          id?: string
          round_id?: string | null
          uploaded_at?: string | null
        }
        Update: {
          file_url?: string
          id?: string
          round_id?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "round_files_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      rounds: {
        Row: {
          city: string | null
          course_id: string | null
          course_name: string
          course_notes: string | null
          course_rating: number | null
          created_at: string | null
          date: string
          fairways_hit: number | null
          final_score: number | null
          greens_in_reg: number | null
          hole_scores: Json | null
          id: string
          num_holes_played: number | null
          par: number | null
          penalties: number | null
          playing_partners: string | null
          putts: number | null
          score_differential: number | null
          score_type: string | null
          slope_rating: number | null
          state: string | null
          tees_played: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          city?: string | null
          course_id?: string | null
          course_name: string
          course_notes?: string | null
          course_rating?: number | null
          created_at?: string | null
          date: string
          fairways_hit?: number | null
          final_score?: number | null
          greens_in_reg?: number | null
          hole_scores?: Json | null
          id?: string
          num_holes_played?: number | null
          par?: number | null
          penalties?: number | null
          playing_partners?: string | null
          putts?: number | null
          score_differential?: number | null
          score_type?: string | null
          slope_rating?: number | null
          state?: string | null
          tees_played?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          city?: string | null
          course_id?: string | null
          course_name?: string
          course_notes?: string | null
          course_rating?: number | null
          created_at?: string | null
          date?: string
          fairways_hit?: number | null
          final_score?: number | null
          greens_in_reg?: number | null
          hole_scores?: Json | null
          id?: string
          num_holes_played?: number | null
          par?: number | null
          penalties?: number | null
          playing_partners?: string | null
          putts?: number | null
          score_differential?: number | null
          score_type?: string | null
          slope_rating?: number | null
          state?: string | null
          tees_played?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          role?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
