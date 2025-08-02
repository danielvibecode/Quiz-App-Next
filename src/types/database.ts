export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      situations: {
        Row: {
          answer_count: number | null
          answers: Json
          correct_answer: number
          created_at: string | null
          created_by: string
          difficulty_level: string | null
          expected_reaction_time: number | null
          explanation: string | null
          freeze_description: string | null
          freeze_point_seconds: number | null
          id: number
          image_url: string
          is_info_only: boolean | null
          media_type: string | null
          question: string
          situation_context: string | null
          team_id: string | null
          updated_at: string | null
          volleyball_category: string | null
        }
        Insert: {
          answer_count?: number | null
          answers: Json
          correct_answer: number
          created_at?: string | null
          created_by: string
          difficulty_level?: string | null
          expected_reaction_time?: number | null
          explanation?: string | null
          freeze_description?: string | null
          freeze_point_seconds?: number | null
          id?: number
          image_url: string
          is_info_only?: boolean | null
          media_type?: string | null
          question: string
          situation_context?: string | null
          team_id?: string | null
          updated_at?: string | null
          volleyball_category?: string | null
        }
        Update: {
          answer_count?: number | null
          answers?: Json
          correct_answer?: number
          created_at?: string | null
          created_by?: string
          difficulty_level?: string | null
          expected_reaction_time?: number | null
          explanation?: string | null
          freeze_description?: string | null
          freeze_point_seconds?: number | null
          id?: number
          image_url?: string
          is_info_only?: boolean | null
          media_type?: string | null
          question?: string
          situation_context?: string | null
          team_id?: string | null
          updated_at?: string | null
          volleyball_category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_situations_team_id"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_stats"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "fk_situations_team_id"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "situations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_stats"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "situations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          id: number
          user_id: string
          situation_id: number
          selected_answer: number
          is_correct: boolean
          time_taken: number | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          situation_id: number
          selected_answer: number
          is_correct: boolean
          time_taken?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          situation_id?: number
          selected_answer?: number
          is_correct?: boolean
          time_taken?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_results_situation_id_fkey"
            columns: ["situation_id"]
            isOneToOne: false
            referencedRelation: "situations"
            referencedColumns: ["id"]
          }
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          invite_code: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          invite_code: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          invite_code?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_answers: {
        Row: {
          answered_at: string | null
          id: number
          is_correct: boolean
          selected_answer: number
          situation_id: number | null
          user_id: string | null
        }
        Insert: {
          answered_at?: string | null
          id?: number
          is_correct: boolean
          selected_answer: number
          situation_id?: number | null
          user_id?: string | null
        }
        Update: {
          answered_at?: string | null
          id?: number
          is_correct?: boolean
          selected_answer?: number
          situation_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_answers_situation_id_fkey"
            columns: ["situation_id"]
            isOneToOne: false
            referencedRelation: "situations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          role: string | null
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id: string
          role?: string | null
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          role?: string | null
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_stats"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "user_profiles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      team_stats: {
        Row: {
          member_count: number | null
          situation_count: number | null
          team_id: string | null
          team_name: string | null
          total_answers: number | null
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          accuracy_percentage: number | null
          correct_answers: number | null
          display_name: string | null
          role: string | null
          team_name: string | null
          total_answers: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      monitor_rls_performance: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          operation: string
          avg_duration_ms: number
          status: string
        }[]
      }
      test_team_isolation: {
        Args: Record<PropertyKey, never>
        Returns: {
          test_name: string
          result: string
        }[]
      }
      test_team_isolation_production: {
        Args: Record<PropertyKey, never>
        Returns: {
          test_name: string
          result: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
