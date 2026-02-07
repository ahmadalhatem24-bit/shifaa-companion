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
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      allergies: {
        Row: {
          allergy_name: string
          created_at: string
          id: string
          notes: string | null
          severity: string | null
          user_id: string
        }
        Insert: {
          allergy_name: string
          created_at?: string
          id?: string
          notes?: string | null
          severity?: string | null
          user_id: string
        }
        Update: {
          allergy_name?: string
          created_at?: string
          id?: string
          notes?: string | null
          severity?: string | null
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          cancel_reason: string | null
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          provider_id: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          cancel_reason?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          provider_id: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          cancel_reason?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          provider_id?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      chronic_diseases: {
        Row: {
          created_at: string
          diagnosis_date: string | null
          disease_name: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          diagnosis_date?: string | null
          disease_name: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          diagnosis_date?: string | null
          disease_name?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      family_history: {
        Row: {
          condition_name: string
          created_at: string
          id: string
          notes: string | null
          relation: string | null
          user_id: string
        }
        Insert: {
          condition_name: string
          created_at?: string
          id?: string
          notes?: string | null
          relation?: string | null
          user_id: string
        }
        Update: {
          condition_name?: string
          created_at?: string
          id?: string
          notes?: string | null
          relation?: string | null
          user_id?: string
        }
        Relationships: []
      }
      medical_documents: {
        Row: {
          created_at: string
          description: string | null
          doctor_name: string | null
          document_date: string | null
          document_type: string
          file_url: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          doctor_name?: string | null
          document_date?: string | null
          document_type: string
          file_url: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          doctor_name?: string | null
          document_date?: string | null
          document_type?: string
          file_url?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          created_at: string
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          medication_name: string
          notes: string | null
          start_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          medication_name: string
          notes?: string | null
          start_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          medication_name?: string
          notes?: string | null
          start_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          blood_type: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          full_name: string
          gender: string | null
          governorate: string | null
          height: number | null
          id: string
          marital_status: string | null
          phone: string | null
          street: string | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          avatar_url?: string | null
          blood_type?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          full_name?: string
          gender?: string | null
          governorate?: string | null
          height?: number | null
          id?: string
          marital_status?: string | null
          phone?: string | null
          street?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          avatar_url?: string | null
          blood_type?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          full_name?: string
          gender?: string | null
          governorate?: string | null
          height?: number | null
          id?: string
          marital_status?: string | null
          phone?: string | null
          street?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      providers: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          consultation_fee: number | null
          created_at: string
          email: string | null
          governorate: string | null
          id: string
          is_verified: boolean | null
          license_number: string | null
          name: string
          phone: string | null
          provider_type: Database["public"]["Enums"]["provider_type"]
          rating: number | null
          review_count: number | null
          specialization: string | null
          updated_at: string
          user_id: string | null
          working_hours: Json | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string
          email?: string | null
          governorate?: string | null
          id?: string
          is_verified?: boolean | null
          license_number?: string | null
          name: string
          phone?: string | null
          provider_type: Database["public"]["Enums"]["provider_type"]
          rating?: number | null
          review_count?: number | null
          specialization?: string | null
          updated_at?: string
          user_id?: string | null
          working_hours?: Json | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string
          email?: string | null
          governorate?: string | null
          id?: string
          is_verified?: boolean | null
          license_number?: string | null
          name?: string
          phone?: string | null
          provider_type?: Database["public"]["Enums"]["provider_type"]
          rating?: number | null
          review_count?: number | null
          specialization?: string | null
          updated_at?: string
          user_id?: string | null
          working_hours?: Json | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          patient_id: string
          provider_id: string
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          patient_id: string
          provider_id: string
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          patient_id?: string
          provider_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_provider_profile: {
        Args: {
          _address?: string
          _email: string
          _governorate?: string
          _license_number?: string
          _name: string
          _provider_type: Database["public"]["Enums"]["provider_type"]
          _specialization?: string
          _user_id: string
        }
        Returns: string
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      provider_can_access_patient: {
        Args: { _patient_id: string }
        Returns: boolean
      }
      set_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      appointment_status: "pending" | "confirmed" | "completed" | "cancelled"
      provider_type:
        | "doctor"
        | "pharmacist"
        | "hospital"
        | "laboratory"
        | "dental"
        | "cosmetic"
      user_role:
        | "patient"
        | "doctor"
        | "pharmacist"
        | "hospital"
        | "laboratory"
        | "admin"
        | "dental"
        | "cosmetic"
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
      appointment_status: ["pending", "confirmed", "completed", "cancelled"],
      provider_type: [
        "doctor",
        "pharmacist",
        "hospital",
        "laboratory",
        "dental",
        "cosmetic",
      ],
      user_role: [
        "patient",
        "doctor",
        "pharmacist",
        "hospital",
        "laboratory",
        "admin",
        "dental",
        "cosmetic",
      ],
    },
  },
} as const
