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
      accounts: {
        Row: {
          balance: number | null
          book_id: string | null
          created_at: string | null
          id: string
          name: string
          type: string | null
        }
        Insert: {
          balance?: number | null
          book_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          type?: string | null
        }
        Update: {
          balance?: number | null
          book_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          id: string
          transaction_id: string | null
          uploaded_at: string | null
          url: string
        }
        Insert: {
          id?: string
          transaction_id?: string | null
          uploaded_at?: string | null
          url: string
        }
        Update: {
          id?: string
          transaction_id?: string | null
          uploaded_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      book_members: {
        Row: {
          book_id: string | null
          id: string
          joined_at: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          book_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          book_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_members_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          created_at: string | null
          currency: string | null
          id: string
          name: string
          owner_id: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          id?: string
          name: string
          owner_id?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          id?: string
          name?: string
          owner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "books_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          amount: number
          book_id: string | null
          category_id: number | null
          created_at: string | null
          id: string
          month: number
          year: number
        }
        Insert: {
          amount: number
          book_id?: string | null
          category_id?: number | null
          created_at?: string | null
          id?: string
          month: number
          year: number
        }
        Update: {
          amount?: number
          book_id?: string | null
          category_id?: number | null
          created_at?: string | null
          id?: string
          month?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "budgets_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          book_id: string | null
          id: number
          name: string
          type: string | null
        }
        Insert: {
          book_id?: string | null
          id?: number
          name: string
          type?: string | null
        }
        Update: {
          book_id?: string | null
          id?: number
          name?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          base_currency: string
          id: number
          last_updated: string
          rate: number
          target_currency: string
        }
        Insert: {
          base_currency: string
          id?: number
          last_updated?: string
          rate: number
          target_currency: string
        }
        Update: {
          base_currency?: string
          id?: number
          last_updated?: string
          rate?: number
          target_currency?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          currency: string
          date: string
          description: string
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          currency?: string
          date?: string
          description: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          currency?: string
          date?: string
          description?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          age: number | null
          allowance: number | null
          created_at: string | null
          id: string
          image: string | null
          is_parent: boolean | null
          name: string
          savings: number | null
          user_id: string
        }
        Insert: {
          age?: number | null
          allowance?: number | null
          created_at?: string | null
          id?: string
          image?: string | null
          is_parent?: boolean | null
          name: string
          savings?: number | null
          user_id: string
        }
        Update: {
          age?: number | null
          allowance?: number | null
          created_at?: string | null
          id?: string
          image?: string | null
          is_parent?: boolean | null
          name?: string
          savings?: number | null
          user_id?: string
        }
        Relationships: []
      }
      labels: {
        Row: {
          book_id: string | null
          id: string
          name: string
        }
        Insert: {
          book_id?: string | null
          id?: string
          name: string
        }
        Update: {
          book_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "labels_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          amount: number
          book_id: string | null
          counterparty: string | null
          created_at: string | null
          due_date: string | null
          id: string
          start_date: string
          status: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          book_id?: string | null
          counterparty?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          start_date: string
          status?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          book_id?: string | null
          counterparty?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          start_date?: string
          status?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loans_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_transactions: {
        Row: {
          account_id: string | null
          amount: number
          book_id: string | null
          category_id: number | null
          created_at: string | null
          description: string | null
          end_date: string | null
          frequency: string
          id: string
          start_date: string
          type: string
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          book_id?: string | null
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          frequency: string
          id?: string
          start_date: string
          type: string
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          book_id?: string | null
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          start_date?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reimbursements: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          id: string
          requested_at: string | null
          requester_id: string | null
          status: string | null
          transaction_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          id?: string
          requested_at?: string | null
          requester_id?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          id?: string
          requested_at?: string | null
          requester_id?: string | null
          status?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reimbursements_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reimbursements_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reimbursements_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_goals: {
        Row: {
          created_at: string | null
          current_amount: number | null
          id: string
          member_id: string
          name: string
          target_amount: number
          target_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_amount?: number | null
          id?: string
          member_id: string
          name: string
          target_amount: number
          target_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_amount?: number | null
          id?: string
          member_id?: string
          name?: string
          target_amount?: number
          target_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_goals_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_labels: {
        Row: {
          label_id: string
          transaction_id: string
        }
        Insert: {
          label_id: string
          transaction_id: string
        }
        Update: {
          label_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "labels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_labels_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          book_id: string | null
          category_id: number | null
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          type: string
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          book_id?: string | null
          category_id?: number | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          type: string
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          book_id?: string | null
          category_id?: number | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
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
