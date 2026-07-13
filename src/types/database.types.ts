export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      pyq_papers: {
        Row: {
          created_at: string
          duration_minutes: number | null
          exam: string
          id: string
          language: string | null
          paper_code: string | null
          section: string | null
          source_file_path: string | null
          status: string
          title: string
          total_marks: number
          total_questions: number
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          exam: string
          id?: string
          language?: string | null
          paper_code?: string | null
          section?: string | null
          source_file_path?: string | null
          status?: string
          title: string
          total_marks?: number
          total_questions?: number
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          exam?: string
          id?: string
          language?: string | null
          paper_code?: string | null
          section?: string | null
          source_file_path?: string | null
          status?: string
          title?: string
          total_marks?: number
          total_questions?: number
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      pyq_paper_questions: {
        Row: {
          created_at: string
          display_order: number
          id: string
          marks: number
          paper_id: string
          question_id: string
          question_number: number
        }
        Insert: {
          created_at?: string
          display_order: number
          id?: string
          marks?: number
          paper_id: string
          question_id: string
          question_number: number
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          marks?: number
          paper_id?: string
          question_id?: string
          question_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "pyq_paper_questions_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "pyq_papers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pyq_paper_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          }
        ]
      }
      achievements: {
        Row: {
          badge_type: string
          earned_at: string
          id: string
          label: string
          user_id: string
        }
        Insert: {
          badge_type: string
          earned_at?: string
          id?: string
          label: string
          user_id: string
        }
        Update: {
          badge_type?: string
          earned_at?: string
          id?: string
          label?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attempts: {
        Row: {
          attempted_at: string
          id: string
          is_correct: boolean
          question_id: string
          selected_option_id: string | null
          session_id: string | null
          time_taken_sec: number | null
          user_id: string
        }
        Insert: {
          attempted_at?: string
          id?: string
          is_correct: boolean
          question_id: string
          selected_option_id?: string | null
          session_id?: string | null
          time_taken_sec?: number | null
          user_id: string
        }
        Update: {
          attempted_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_option_id?: string | null
          session_id?: string | null
          time_taken_sec?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      book_pages: {
        Row: {
          book_id: string
          content_text: string | null
          created_at: string
          id: string
          image_url: string | null
          page_number: number
        }
        Insert: {
          book_id: string
          content_text?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          page_number: number
        }
        Update: {
          book_id?: string
          content_text?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          page_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "book_pages_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          note: string | null
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          board: string | null
          class_level: number | null
          created_at: string
          id: string
          pdf_url: string | null
          subject: string | null
          title: string
          total_pages: number | null
        }
        Insert: {
          board?: string | null
          class_level?: number | null
          created_at?: string
          id?: string
          pdf_url?: string | null
          subject?: string | null
          title: string
          total_pages?: number | null
        }
        Update: {
          board?: string | null
          class_level?: number | null
          created_at?: string
          id?: string
          pdf_url?: string | null
          subject?: string | null
          title?: string
          total_pages?: number | null
        }
        Relationships: []
      }
      chapters: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_index: number
          subject_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          subject_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          subject_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      current_affairs: {
        Row: {
          body: string
          category: string | null
          created_at: string
          has_quiz: boolean
          id: string
          published_date: string
          source_url: string | null
          title: string
        }
        Insert: {
          body: string
          category?: string | null
          created_at?: string
          has_quiz?: boolean
          id?: string
          published_date: string
          source_url?: string | null
          title: string
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string
          has_quiz?: boolean
          id?: string
          published_date?: string
          source_url?: string | null
          title?: string
        }
        Relationships: []
      }
      daily_quizzes: {
        Row: {
          created_at: string
          id: string
          question_ids: string[]
          quiz_date: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_ids: string[]
          quiz_date: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_ids?: string[]
          quiz_date?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_quizzes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_quizzes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      explanations: {
        Row: {
          body: string
          book_reference: string | null
          created_at: string
          id: string
          page_number: number | null
          question_id: string
        }
        Insert: {
          body: string
          book_reference?: string | null
          created_at?: string
          id?: string
          page_number?: number | null
          question_id: string
        }
        Update: {
          body?: string
          book_reference?: string | null
          created_at?: string
          id?: string
          page_number?: number | null
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "explanations_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: true
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      options: {
        Row: {
          body: string
          created_at: string
          id: string
          is_correct: boolean
          label: string
          question_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_correct?: boolean
          label: string
          question_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_correct?: boolean
          label?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_active_date: string | null
          level: number
          longest_streak: number
          name: string | null
          phone: string | null
          target_exam: string | null
          total_xp: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id: string
          last_active_date?: string | null
          level?: number
          longest_streak?: number
          name?: string | null
          phone?: string | null
          target_exam?: string | null
          total_xp?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_active_date?: string | null
          level?: number
          longest_streak?: number
          name?: string | null
          phone?: string | null
          target_exam?: string | null
          total_xp?: number
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          body: string
          book_id: string | null
          chapter_id: string | null
          created_at: string
          difficulty: string | null
          exam_type: string | null
          id: string
          is_pyq: boolean
          language: string | null
          marks: number | null
          source_reference: string | null
          subject_id: string | null
          year: number | null
          topic: string | null
          keywords: string[] | null
          source: string | null
          reference_book: string | null
          status: string | null
        }
        Insert: {
          body: string
          book_id?: string | null
          chapter_id?: string | null
          created_at?: string
          difficulty?: string | null
          exam_type?: string | null
          id?: string
          is_pyq?: boolean
          language?: string | null
          marks?: number | null
          source_reference?: string | null
          subject_id?: string | null
          year?: number | null
          topic?: string | null
          keywords?: string[] | null
          source?: string | null
          reference_book?: string | null
          status?: string | null
        }
        Update: {
          body?: string
          book_id?: string | null
          chapter_id?: string | null
          created_at?: string
          difficulty?: string | null
          exam_type?: string | null
          id?: string
          is_pyq?: boolean
          language?: string | null
          marks?: number | null
          source_reference?: string | null
          subject_id?: string | null
          year?: number | null
          topic?: string | null
          keywords?: string[] | null
          source?: string | null
          reference_book?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      revision_schedule: {
        Row: {
          due_date: string
          ease_factor: number | null
          id: string
          interval_days: number | null
          question_id: string
          review_count: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          due_date: string
          ease_factor?: number | null
          id?: string
          interval_days?: number | null
          question_id: string
          review_count?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          due_date?: string
          ease_factor?: number | null
          id?: string
          interval_days?: number | null
          question_id?: string
          review_count?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revision_schedule_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revision_schedule_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          chapter_id: string | null
          correct: number
          duration_sec: number | null
          ended_at: string | null
          id: string
          started_at: string
          status: string
          subject_id: string | null
          total_questions: number
          type: string
          user_id: string
          paper_id: string | null
        }
        Insert: {
          chapter_id?: string | null
          correct?: number
          duration_sec?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          status?: string
          subject_id?: string | null
          total_questions?: number
          type: string
          user_id: string
          paper_id?: string | null
        }
        Update: {
          chapter_id?: string | null
          correct?: number
          duration_sec?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          status?: string
          subject_id?: string | null
          total_questions?: number
          type?: string
          user_id?: string
          paper_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "pyq_papers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plans: {
        Row: {
          created_at: string
          daily_goals: Json
          id: string
          is_active: boolean
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_goals?: Json
          id?: string
          is_active?: boolean
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_goals?: Json
          id?: string
          is_active?: boolean
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
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
