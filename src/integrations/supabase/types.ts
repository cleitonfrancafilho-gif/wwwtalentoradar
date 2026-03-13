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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      athlete_evaluations: {
        Row: {
          athlete_id: string
          created_at: string
          dribble: number | null
          evaluator_id: string
          id: string
          notes: string | null
          speed: number | null
          stamina: number | null
          strength: number | null
          tactics: number | null
          technique: number | null
        }
        Insert: {
          athlete_id: string
          created_at?: string
          dribble?: number | null
          evaluator_id: string
          id?: string
          notes?: string | null
          speed?: number | null
          stamina?: number | null
          strength?: number | null
          tactics?: number | null
          technique?: number | null
        }
        Update: {
          athlete_id?: string
          created_at?: string
          dribble?: number | null
          evaluator_id?: string
          id?: string
          notes?: string | null
          speed?: number | null
          stamina?: number | null
          strength?: number | null
          tactics?: number | null
          technique?: number | null
        }
        Relationships: []
      }
      club_history: {
        Row: {
          achievements: string | null
          club_name: string
          created_at: string
          id: string
          period_end: string | null
          period_start: string
          user_id: string
        }
        Insert: {
          achievements?: string | null
          club_name: string
          created_at?: string
          id?: string
          period_end?: string | null
          period_start: string
          user_id: string
        }
        Update: {
          achievements?: string | null
          club_name?: string
          created_at?: string
          id?: string
          period_end?: string | null
          period_start?: string
          user_id?: string
        }
        Relationships: []
      }
      community_votes: {
        Row: {
          athlete_id: string
          created_at: string
          id: string
          voter_id: string
          week_start: string
        }
        Insert: {
          athlete_id: string
          created_at?: string
          id?: string
          voter_id: string
          week_start: string
        }
        Update: {
          athlete_id?: string
          created_at?: string
          id?: string
          voter_id?: string
          week_start?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          accepted: boolean
          created_at: string
          id: string
          last_message_at: string | null
          muted_by_1: boolean | null
          muted_by_2: boolean | null
          participant_1: string
          participant_2: string
          pinned_by_1: boolean | null
          pinned_by_2: boolean | null
        }
        Insert: {
          accepted?: boolean
          created_at?: string
          id?: string
          last_message_at?: string | null
          muted_by_1?: boolean | null
          muted_by_2?: boolean | null
          participant_1: string
          participant_2: string
          pinned_by_1?: boolean | null
          pinned_by_2?: boolean | null
        }
        Update: {
          accepted?: boolean
          created_at?: string
          id?: string
          last_message_at?: string | null
          muted_by_1?: boolean | null
          muted_by_2?: boolean | null
          participant_1?: string
          participant_2?: string
          pinned_by_1?: boolean | null
          pinned_by_2?: boolean | null
        }
        Relationships: []
      }
      event_applications: {
        Row: {
          athlete_id: string
          created_at: string
          event_id: string
          id: string
          status: string
          video_url: string | null
        }
        Insert: {
          athlete_id: string
          created_at?: string
          event_id: string
          id?: string
          status?: string
          video_url?: string | null
        }
        Update: {
          athlete_id?: string
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_applications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "recruitment_events"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          athlete_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          athlete_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          athlete_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          receiver_id: string
          sender_id: string
          type: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
          type?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
          type?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string
          created_at: string
          id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body: string
          created_at?: string
          id?: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          anonymous_mode: boolean | null
          area_of_operation: string | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          cnpj: string | null
          cpf: string | null
          created_at: string
          dominant_foot: string | null
          email: string
          full_name: string
          height_cm: number | null
          id: string
          legal_representative: string | null
          phone: string | null
          position: string | null
          professional_link: string | null
          profile_type: Database["public"]["Enums"]["profile_type"]
          registration_number: string | null
          representation_status: string | null
          sport: string | null
          updated_at: string
          weight_kg: number | null
          wingspan_cm: number | null
        }
        Insert: {
          address?: string | null
          anonymous_mode?: boolean | null
          area_of_operation?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          dominant_foot?: string | null
          email?: string
          full_name?: string
          height_cm?: number | null
          id: string
          legal_representative?: string | null
          phone?: string | null
          position?: string | null
          professional_link?: string | null
          profile_type?: Database["public"]["Enums"]["profile_type"]
          registration_number?: string | null
          representation_status?: string | null
          sport?: string | null
          updated_at?: string
          weight_kg?: number | null
          wingspan_cm?: number | null
        }
        Update: {
          address?: string | null
          anonymous_mode?: boolean | null
          area_of_operation?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          dominant_foot?: string | null
          email?: string
          full_name?: string
          height_cm?: number | null
          id?: string
          legal_representative?: string | null
          phone?: string | null
          position?: string | null
          professional_link?: string | null
          profile_type?: Database["public"]["Enums"]["profile_type"]
          registration_number?: string | null
          representation_status?: string | null
          sport?: string | null
          updated_at?: string
          weight_kg?: number | null
          wingspan_cm?: number | null
        }
        Relationships: []
      }
      recruitment_events: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          event_date: string | null
          id: string
          location: string | null
          max_age: number | null
          min_height_cm: number | null
          position: string | null
          sport: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          max_age?: number | null
          min_height_cm?: number | null
          position?: string | null
          sport: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          max_age?: number | null
          min_height_cm?: number | null
          position?: string | null
          sport?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          plan: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          plan?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          plan?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      training_checkins: {
        Row: {
          check_date: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          check_date?: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          check_date?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_pro_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      profile_type: "atleta" | "olheiro" | "instituicao"
      subscription_status:
        | "active"
        | "canceled"
        | "past_due"
        | "trialing"
        | "inactive"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
      profile_type: ["atleta", "olheiro", "instituicao"],
      subscription_status: [
        "active",
        "canceled",
        "past_due",
        "trialing",
        "inactive",
      ],
    },
  },
} as const
