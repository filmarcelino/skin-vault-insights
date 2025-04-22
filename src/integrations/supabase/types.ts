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
      coupons: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          created_by: string | null
          duration_months: number
          id: string
          max_redemptions: number | null
          times_redeemed: number | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          created_by?: string | null
          duration_months?: number
          id?: string
          max_redemptions?: number | null
          times_redeemed?: number | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          duration_months?: number
          id?: string
          max_redemptions?: number | null
          times_redeemed?: number | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          acquired_date: string
          collection_id: string | null
          collection_name: string | null
          created_at: string
          current_price: number | null
          fee_percentage: number | null
          float_value: number | null
          id: string
          image: string | null
          inventory_id: string
          is_in_user_inventory: boolean | null
          is_stat_trak: boolean | null
          marketplace: string | null
          name: string
          notes: string | null
          price: number | null
          purchase_price: number | null
          rarity: string | null
          skin_id: string
          trade_lock_days: number | null
          trade_lock_until: string | null
          updated_at: string
          user_id: string
          weapon: string | null
          wear: string | null
        }
        Insert: {
          acquired_date?: string
          collection_id?: string | null
          collection_name?: string | null
          created_at?: string
          current_price?: number | null
          fee_percentage?: number | null
          float_value?: number | null
          id?: string
          image?: string | null
          inventory_id: string
          is_in_user_inventory?: boolean | null
          is_stat_trak?: boolean | null
          marketplace?: string | null
          name: string
          notes?: string | null
          price?: number | null
          purchase_price?: number | null
          rarity?: string | null
          skin_id: string
          trade_lock_days?: number | null
          trade_lock_until?: string | null
          updated_at?: string
          user_id: string
          weapon?: string | null
          wear?: string | null
        }
        Update: {
          acquired_date?: string
          collection_id?: string | null
          collection_name?: string | null
          created_at?: string
          current_price?: number | null
          fee_percentage?: number | null
          float_value?: number | null
          id?: string
          image?: string | null
          inventory_id?: string
          is_in_user_inventory?: boolean | null
          is_stat_trak?: boolean | null
          marketplace?: string | null
          name?: string
          notes?: string | null
          price?: number | null
          purchase_price?: number | null
          rarity?: string | null
          skin_id?: string
          trade_lock_days?: number | null
          trade_lock_until?: string | null
          updated_at?: string
          user_id?: string
          weapon?: string | null
          wear?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_admin: boolean | null
          preferred_currency: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_admin?: boolean | null
          preferred_currency?: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_admin?: boolean | null
          preferred_currency?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          coupon_id: string | null
          created_at: string
          email: string
          id: string
          is_trial: boolean | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          coupon_id?: string | null
          created_at?: string
          email: string
          id?: string
          is_trial?: boolean | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          coupon_id?: string | null
          created_at?: string
          email?: string
          id?: string
          is_trial?: boolean | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          created_at: string
          date: string
          id: string
          item_id: string
          notes: string | null
          price: number | null
          skin_name: string | null
          transaction_id: string
          type: string
          user_id: string
          weapon_name: string | null
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          item_id: string
          notes?: string | null
          price?: number | null
          skin_name?: string | null
          transaction_id: string
          type: string
          user_id: string
          weapon_name?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          item_id?: string
          notes?: string | null
          price?: number | null
          skin_name?: string | null
          transaction_id?: string
          type?: string
          user_id?: string
          weapon_name?: string | null
        }
        Relationships: []
      }
      user_coupons: {
        Row: {
          applied_at: string | null
          coupon_id: string
          expires_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          coupon_id: string
          expires_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          coupon_id?: string
          expires_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_coupons_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
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
