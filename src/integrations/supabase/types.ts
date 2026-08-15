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
      ea_licenses: {
        Row: {
          created_at: string
          email: string | null
          expires_at: string
          id: string
          member_name: string
          mt5_account_id: string
          notes: string | null
          phone: string | null
          product: string
          status: string
          suspend_request_note: string | null
          suspend_requested_at: string | null
          suspend_requested_by: string | null
          uid: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          expires_at: string
          id?: string
          member_name: string
          mt5_account_id: string
          notes?: string | null
          phone?: string | null
          product: string
          status?: string
          suspend_request_note?: string | null
          suspend_requested_at?: string | null
          suspend_requested_by?: string | null
          uid?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          member_name?: string
          mt5_account_id?: string
          notes?: string | null
          phone?: string | null
          product?: string
          status?: string
          suspend_request_note?: string | null
          suspend_requested_at?: string | null
          suspend_requested_by?: string | null
          uid?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          customer_email: string | null
          id: string
          metadata: Json | null
          mt5_uid: string | null
          plan: Database["public"]["Enums"]["plan_type"] | null
          source: string
          status: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          id?: string
          metadata?: Json | null
          mt5_uid?: string | null
          plan?: Database["public"]["Enums"]["plan_type"] | null
          source?: string
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          customer_email?: string | null
          id?: string
          metadata?: Json | null
          mt5_uid?: string | null
          plan?: Database["public"]["Enums"]["plan_type"] | null
          source?: string
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          customer_email: string | null
          expires_at: string | null
          id: string
          mt5_uid: string
          next_billing_at: string | null
          notes: string | null
          plan: Database["public"]["Enums"]["plan_type"]
          products: string[]
          renewal_pause_approved_at: string | null
          renewal_pause_rejected_at: string | null
          renewal_pause_request_note: string | null
          renewal_pause_requested_at: string | null
          renewal_pause_requested_by: string | null
          source: string
          started_at: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          stripe_subscription_id: string | null
          suspend_request_note: string | null
          suspend_requested_at: string | null
          suspend_requested_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          customer_email?: string | null
          expires_at?: string | null
          id?: string
          mt5_uid: string
          next_billing_at?: string | null
          notes?: string | null
          plan: Database["public"]["Enums"]["plan_type"]
          products?: string[]
          renewal_pause_approved_at?: string | null
          renewal_pause_rejected_at?: string | null
          renewal_pause_request_note?: string | null
          renewal_pause_requested_at?: string | null
          renewal_pause_requested_by?: string | null
          source?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          suspend_request_note?: string | null
          suspend_requested_at?: string | null
          suspend_requested_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          customer_email?: string | null
          expires_at?: string | null
          id?: string
          mt5_uid?: string
          next_billing_at?: string | null
          notes?: string | null
          plan?: Database["public"]["Enums"]["plan_type"]
          products?: string[]
          renewal_pause_approved_at?: string | null
          renewal_pause_rejected_at?: string | null
          renewal_pause_request_note?: string | null
          renewal_pause_requested_at?: string | null
          renewal_pause_requested_by?: string | null
          source?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          suspend_request_note?: string | null
          suspend_requested_at?: string | null
          suspend_requested_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      plan_type: "basic" | "access" | "managed"
      subscription_status: "active" | "expired" | "cancelled" | "pending"
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
      app_role: ["admin", "member"],
      payment_status: ["pending", "paid", "failed", "refunded"],
      plan_type: ["basic", "access", "managed"],
      subscription_status: ["active", "expired", "cancelled", "pending"],
    },
  },
} as const
