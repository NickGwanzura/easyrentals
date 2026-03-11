export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          role: 'admin' | 'landlord' | 'agent' | 'tenant'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          role?: 'admin' | 'landlord' | 'agent' | 'tenant'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          role?: 'admin' | 'landlord' | 'agent' | 'tenant'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          title: string
          description: string | null
          address: string
          city: string
          state: string
          zip_code: string
          country: string
          type: 'apartment' | 'house' | 'condo' | 'townhouse' | 'commercial'
          status: 'vacant' | 'occupied' | 'maintenance' | 'inactive'
          bedrooms: number
          bathrooms: number
          square_feet: number
          year_built: number | null
          monthly_rent: number
          deposit_amount: number
          images: string[]
          featured_image: string | null
          landlord_id: string
          agent_id: string | null
          current_tenant_id: string | null
          amenities: string[]
          created_at: string
          updated_at: string
          listed_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          address: string
          city: string
          state: string
          zip_code: string
          country: string
          type: 'apartment' | 'house' | 'condo' | 'townhouse' | 'commercial'
          status?: 'vacant' | 'occupied' | 'maintenance' | 'inactive'
          bedrooms?: number
          bathrooms?: number
          square_feet?: number
          year_built?: number | null
          monthly_rent: number
          deposit_amount?: number
          images?: string[]
          featured_image?: string | null
          landlord_id: string
          agent_id?: string | null
          current_tenant_id?: string | null
          amenities?: string[]
          created_at?: string
          updated_at?: string
          listed_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          address?: string
          city?: string
          state?: string
          zip_code?: string
          country?: string
          type?: 'apartment' | 'house' | 'condo' | 'townhouse' | 'commercial'
          status?: 'vacant' | 'occupied' | 'maintenance' | 'inactive'
          bedrooms?: number
          bathrooms?: number
          square_feet?: number
          year_built?: number | null
          monthly_rent?: number
          deposit_amount?: number
          images?: string[]
          featured_image?: string | null
          landlord_id?: string
          agent_id?: string | null
          current_tenant_id?: string | null
          amenities?: string[]
          created_at?: string
          updated_at?: string
          listed_at?: string | null
        }
      }
      tenants: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employer: string | null
          employment_status: 'employed' | 'self-employed' | 'unemployed' | 'student' | 'retired' | null
          monthly_income: number | null
          current_property_id: string | null
          lease_start_date: string | null
          lease_end_date: string | null
          status: 'active' | 'inactive' | 'pending' | 'evicted'
          credit_score: number | null
          background_check_status: 'pending' | 'passed' | 'failed' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employer?: string | null
          employment_status?: 'employed' | 'self-employed' | 'unemployed' | 'student' | 'retired' | null
          monthly_income?: number | null
          current_property_id?: string | null
          lease_start_date?: string | null
          lease_end_date?: string | null
          status?: 'active' | 'inactive' | 'pending' | 'evicted'
          credit_score?: number | null
          background_check_status?: 'pending' | 'passed' | 'failed' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employer?: string | null
          employment_status?: 'employed' | 'self-employed' | 'unemployed' | 'student' | 'retired' | null
          monthly_income?: number | null
          current_property_id?: string | null
          lease_start_date?: string | null
          lease_end_date?: string | null
          status?: 'active' | 'inactive' | 'pending' | 'evicted'
          credit_score?: number | null
          background_check_status?: 'pending' | 'passed' | 'failed' | null
          created_at?: string
          updated_at?: string
        }
      }
      leases: {
        Row: {
          id: string
          property_id: string
          tenant_id: string
          landlord_id: string
          start_date: string
          end_date: string
          monthly_rent: number
          deposit_amount: number
          late_fee_amount: number
          payment_due_day: number
          grace_period_days: number
          status: 'active' | 'expired' | 'terminated' | 'pending'
          documents: string[] | null
          created_at: string
          updated_at: string
          terminated_at: string | null
          termination_reason: string | null
        }
        Insert: {
          id?: string
          property_id: string
          tenant_id: string
          landlord_id: string
          start_date: string
          end_date: string
          monthly_rent: number
          deposit_amount?: number
          late_fee_amount?: number
          payment_due_day?: number
          grace_period_days?: number
          status?: 'active' | 'expired' | 'terminated' | 'pending'
          documents?: string[] | null
          created_at?: string
          updated_at?: string
          terminated_at?: string | null
          termination_reason?: string | null
        }
        Update: {
          id?: string
          property_id?: string
          tenant_id?: string
          landlord_id?: string
          start_date?: string
          end_date?: string
          monthly_rent?: number
          deposit_amount?: number
          late_fee_amount?: number
          payment_due_day?: number
          grace_period_days?: number
          status?: 'active' | 'expired' | 'terminated' | 'pending'
          documents?: string[] | null
          created_at?: string
          updated_at?: string
          terminated_at?: string | null
          termination_reason?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          tenant_id: string
          property_id: string
          lease_id: string | null
          amount: number
          type: 'rent' | 'deposit' | 'late_fee' | 'maintenance' | 'other'
          status: 'paid' | 'pending' | 'overdue' | 'partial' | 'failed'
          method: 'cash' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'check' | 'money_order' | 'online'
          payment_for_month: number
          payment_for_year: number
          due_date: string
          paid_date: string | null
          transaction_id: string | null
          check_number: string | null
          notes: string | null
          created_at: string
          updated_at: string
          recorded_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          property_id: string
          lease_id?: string | null
          amount: number
          type: 'rent' | 'deposit' | 'late_fee' | 'maintenance' | 'other'
          status?: 'paid' | 'pending' | 'overdue' | 'partial' | 'failed'
          method: 'cash' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'check' | 'money_order' | 'online'
          payment_for_month: number
          payment_for_year: number
          due_date: string
          paid_date?: string | null
          transaction_id?: string | null
          check_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          recorded_by?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          property_id?: string
          lease_id?: string | null
          amount?: number
          type?: 'rent' | 'deposit' | 'late_fee' | 'maintenance' | 'other'
          status?: 'paid' | 'pending' | 'overdue' | 'partial' | 'failed'
          method?: 'cash' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'check' | 'money_order' | 'online'
          payment_for_month?: number
          payment_for_year?: number
          due_date?: string
          paid_date?: string | null
          transaction_id?: string | null
          check_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          recorded_by?: string | null
        }
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
  }
}
