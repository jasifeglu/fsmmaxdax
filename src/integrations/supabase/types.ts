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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      devices: {
        Row: {
          brand: string
          created_at: string
          customer_id: string | null
          device_name: string
          eid: string | null
          id: string
          installation_date: string | null
          model: string
          notes: string | null
          serial_number: string | null
          updated_at: string
          warranty_status: string
        }
        Insert: {
          brand?: string
          created_at?: string
          customer_id?: string | null
          device_name?: string
          eid?: string | null
          id?: string
          installation_date?: string | null
          model?: string
          notes?: string | null
          serial_number?: string | null
          updated_at?: string
          warranty_status?: string
        }
        Update: {
          brand?: string
          created_at?: string
          customer_id?: string | null
          device_name?: string
          eid?: string | null
          id?: string
          installation_date?: string | null
          model?: string
          notes?: string | null
          serial_number?: string | null
          updated_at?: string
          warranty_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "devices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      distance_charge_rules: {
        Row: {
          base_fee: number
          created_at: string
          id: string
          is_active: boolean
          max_km: number
          min_km: number
          name: string
          per_km_rate: number
          updated_at: string
        }
        Insert: {
          base_fee?: number
          created_at?: string
          id?: string
          is_active?: boolean
          max_km?: number
          min_km?: number
          name: string
          per_km_rate?: number
          updated_at?: string
        }
        Update: {
          base_fee?: number
          created_at?: string
          id?: string
          is_active?: boolean
          max_km?: number
          min_km?: number
          name?: string
          per_km_rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      incentive_rules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          metric: string
          name: string
          reward_unit: string
          reward_value: number
          target_value: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metric?: string
          name: string
          reward_unit?: string
          reward_value?: number
          target_value?: number
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metric?: string
          name?: string
          reward_unit?: string
          reward_value?: number
          target_value?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string
          created_at: string
          id: string
          min_stock: number
          name: string
          price: number
          sku: string
          status: string
          updated_at: string
          van_stock: number
          warehouse_stock: number
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          min_stock?: number
          name: string
          price?: number
          sku: string
          status?: string
          updated_at?: string
          van_stock?: number
          warehouse_stock?: number
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          min_stock?: number
          name?: string
          price?: number
          sku?: string
          status?: string
          updated_at?: string
          van_stock?: number
          warehouse_stock?: number
        }
        Relationships: []
      }
      inventory_transactions: {
        Row: {
          created_at: string
          from_location: string
          id: string
          inventory_id: string
          notes: string | null
          performed_by: string
          quantity: number
          ticket_id: string | null
          to_location: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          from_location?: string
          id?: string
          inventory_id: string
          notes?: string | null
          performed_by: string
          quantity?: number
          ticket_id?: string | null
          to_location?: string
          transaction_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          from_location?: string
          id?: string
          inventory_id?: string
          notes?: string | null
          performed_by?: string
          quantity?: number
          ticket_id?: string | null
          to_location?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          cgst_rate: number
          created_at: string
          description: string
          hsn_sac_code: string | null
          id: string
          igst_rate: number
          inventory_id: string | null
          invoice_id: string
          quantity: number
          sgst_rate: number
          tax_amount: number
          taxable_value: number
          total_amount: number
          unit_price: number
        }
        Insert: {
          cgst_rate?: number
          created_at?: string
          description?: string
          hsn_sac_code?: string | null
          id?: string
          igst_rate?: number
          inventory_id?: string | null
          invoice_id: string
          quantity?: number
          sgst_rate?: number
          tax_amount?: number
          taxable_value?: number
          total_amount?: number
          unit_price?: number
        }
        Update: {
          cgst_rate?: number
          created_at?: string
          description?: string
          hsn_sac_code?: string | null
          id?: string
          igst_rate?: number
          inventory_id?: string | null
          invoice_id?: string
          quantity?: number
          sgst_rate?: number
          tax_amount?: number
          taxable_value?: number
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_in_words: string | null
          cgst_total: number
          created_at: string
          created_by: string | null
          customer_address: string | null
          customer_gstin: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          grand_total: number
          id: string
          igst_total: number
          invoice_date: string
          invoice_number: string
          is_interstate: boolean
          notes: string | null
          payment_mode: string
          payment_status: string
          place_of_supply: string
          sgst_total: number
          subtotal: number
          ticket_id: string | null
          transaction_reference: string | null
          updated_at: string
        }
        Insert: {
          amount_in_words?: string | null
          cgst_total?: number
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_gstin?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          grand_total?: number
          id?: string
          igst_total?: number
          invoice_date?: string
          invoice_number: string
          is_interstate?: boolean
          notes?: string | null
          payment_mode?: string
          payment_status?: string
          place_of_supply?: string
          sgst_total?: number
          subtotal?: number
          ticket_id?: string | null
          transaction_reference?: string | null
          updated_at?: string
        }
        Update: {
          amount_in_words?: string | null
          cgst_total?: number
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_gstin?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          grand_total?: number
          id?: string
          igst_total?: number
          invoice_date?: string
          invoice_number?: string
          is_interstate?: boolean
          notes?: string | null
          payment_mode?: string
          payment_status?: string
          place_of_supply?: string
          sgst_total?: number
          subtotal?: number
          ticket_id?: string | null
          transaction_reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      password_reset_logs: {
        Row: {
          action: string
          admin_id: string
          admin_name: string
          created_at: string
          id: string
          reason: string | null
          target_user_id: string
          target_user_name: string
        }
        Insert: {
          action?: string
          admin_id: string
          admin_name?: string
          created_at?: string
          id?: string
          reason?: string | null
          target_user_id: string
          target_user_name?: string
        }
        Update: {
          action?: string
          admin_id?: string
          admin_name?: string
          created_at?: string
          id?: string
          reason?: string | null
          target_user_id?: string
          target_user_name?: string
        }
        Relationships: []
      }
      product_catalog: {
        Row: {
          brand: string
          category: string
          created_at: string
          description: string | null
          hsn_sac_code: string | null
          id: string
          is_active: boolean
          model: string
          name: string
          service_price: number
          spare_parts: string | null
          updated_at: string
          warranty_months: number
        }
        Insert: {
          brand?: string
          category?: string
          created_at?: string
          description?: string | null
          hsn_sac_code?: string | null
          id?: string
          is_active?: boolean
          model?: string
          name: string
          service_price?: number
          spare_parts?: string | null
          updated_at?: string
          warranty_months?: number
        }
        Update: {
          brand?: string
          category?: string
          created_at?: string
          description?: string | null
          hsn_sac_code?: string | null
          id?: string
          is_active?: boolean
          model?: string
          name?: string
          service_price?: number
          spare_parts?: string | null
          updated_at?: string
          warranty_months?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchase_requests: {
        Row: {
          approved_by: string | null
          created_at: string
          id: string
          inventory_id: string
          notes: string | null
          reason: string
          requested_by: string
          requested_quantity: number
          status: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          id?: string
          inventory_id: string
          notes?: string | null
          reason?: string
          requested_by: string
          requested_quantity?: number
          status?: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          id?: string
          inventory_id?: string
          notes?: string | null
          reason?: string
          requested_by?: string
          requested_quantity?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_requests_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      selfie_checkins: {
        Row: {
          address: string | null
          checkin_type: string
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          selfie_url: string | null
          ticket_id: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          checkin_type?: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          selfie_url?: string | null
          ticket_id?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          checkin_type?: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          selfie_url?: string | null
          ticket_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "selfie_checkins_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      technician_incentives: {
        Row: {
          approved_by: string | null
          attendance_bonus: number
          avg_completion_hours: number
          avg_rating: number
          completed_tickets: number
          created_at: string
          first_fix_rate: number
          id: string
          month: string
          on_time_rate: number
          performance_bonus: number
          performance_score: number
          quality_bonus: number
          revenue_commission: number
          revenue_generated: number
          speed_bonus: number
          status: string
          total_incentive: number
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_by?: string | null
          attendance_bonus?: number
          avg_completion_hours?: number
          avg_rating?: number
          completed_tickets?: number
          created_at?: string
          first_fix_rate?: number
          id?: string
          month: string
          on_time_rate?: number
          performance_bonus?: number
          performance_score?: number
          quality_bonus?: number
          revenue_commission?: number
          revenue_generated?: number
          speed_bonus?: number
          status?: string
          total_incentive?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_by?: string | null
          attendance_bonus?: number
          avg_completion_hours?: number
          avg_rating?: number
          completed_tickets?: number
          created_at?: string
          first_fix_rate?: number
          id?: string
          month?: string
          on_time_rate?: number
          performance_bonus?: number
          performance_score?: number
          quality_bonus?: number
          revenue_commission?: number
          revenue_generated?: number
          speed_bonus?: number
          status?: string
          total_incentive?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      technician_skills: {
        Row: {
          created_at: string
          home_address: string | null
          home_latitude: number | null
          home_longitude: number | null
          id: string
          max_daily_jobs: number
          proficiency_level: string
          skill_category: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          home_address?: string | null
          home_latitude?: number | null
          home_longitude?: number | null
          id?: string
          max_daily_jobs?: number
          proficiency_level?: string
          skill_category?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          home_address?: string | null
          home_latitude?: number | null
          home_longitude?: number | null
          id?: string
          max_daily_jobs?: number
          proficiency_level?: string
          skill_category?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_comments: {
        Row: {
          attachment_urls: string[] | null
          content: string
          created_at: string
          deleted_by: string | null
          id: string
          is_deleted: boolean
          is_edited: boolean
          is_pinned: boolean
          is_question: boolean
          is_resolved: boolean
          is_urgent: boolean
          mentions: string[] | null
          parent_id: string | null
          requires_response: boolean
          ticket_id: string
          updated_at: string
          user_id: string
          user_name: string
          user_role: string
        }
        Insert: {
          attachment_urls?: string[] | null
          content?: string
          created_at?: string
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          is_pinned?: boolean
          is_question?: boolean
          is_resolved?: boolean
          is_urgent?: boolean
          mentions?: string[] | null
          parent_id?: string | null
          requires_response?: boolean
          ticket_id: string
          updated_at?: string
          user_id: string
          user_name?: string
          user_role?: string
        }
        Update: {
          attachment_urls?: string[] | null
          content?: string
          created_at?: string
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          is_pinned?: boolean
          is_question?: boolean
          is_resolved?: boolean
          is_urgent?: boolean
          mentions?: string[] | null
          parent_id?: string | null
          requires_response?: boolean
          ticket_id?: string
          updated_at?: string
          user_id?: string
          user_name?: string
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ticket_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_technicians: {
        Row: {
          assignment_type: string
          checkin_time: string | null
          checkout_time: string | null
          created_at: string
          customer_signature_url: string | null
          id: string
          notes: string | null
          photos: string[] | null
          role: string
          sequence_order: number
          ticket_id: string
          updated_at: string
          user_id: string
          work_performed: string | null
        }
        Insert: {
          assignment_type?: string
          checkin_time?: string | null
          checkout_time?: string | null
          created_at?: string
          customer_signature_url?: string | null
          id?: string
          notes?: string | null
          photos?: string[] | null
          role?: string
          sequence_order?: number
          ticket_id: string
          updated_at?: string
          user_id: string
          work_performed?: string | null
        }
        Update: {
          assignment_type?: string
          checkin_time?: string | null
          checkout_time?: string | null
          created_at?: string
          customer_signature_url?: string | null
          id?: string
          notes?: string | null
          photos?: string[] | null
          role?: string
          sequence_order?: number
          ticket_id?: string
          updated_at?: string
          user_id?: string
          work_performed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_technicians_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_timeline: {
        Row: {
          action: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          ticket_id: string
          user_id: string
          user_name: string
        }
        Insert: {
          action?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          ticket_id: string
          user_id: string
          user_name?: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          ticket_id?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_timeline_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          additional_service_charge: number | null
          assigned_to: string | null
          assignee_name: string | null
          category: string
          company_margin_pct: number | null
          complaint_description: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          customer_address: string | null
          customer_explanation: string | null
          customer_id: string | null
          customer_latitude: number | null
          customer_longitude: number | null
          customer_name: string
          customer_phone: string
          delay_category: string | null
          delay_reason: string | null
          device_id: string | null
          distance_charge: number | null
          distance_km: number | null
          final_customer_amount: number | null
          id: string
          issue: string
          notes: string | null
          pickup_date: string | null
          priority: string
          product_id: string | null
          product_returned_date: string | null
          scheduled_at: string | null
          sent_to_vendor_date: string | null
          service_charge: number | null
          sla_hours: number | null
          status: string
          technician_observations: string | null
          ticket_number: string
          updated_at: string
          vendor_completion_date: string | null
          vendor_expected_completion: string | null
          vendor_id: string | null
          vendor_invoice_amount: number | null
          vendor_invoice_url: string | null
          vendor_registration_date: string | null
          vendor_service_notes: string | null
          vendor_srn: string | null
          vendor_ticket_number: string | null
        }
        Insert: {
          additional_service_charge?: number | null
          assigned_to?: string | null
          assignee_name?: string | null
          category?: string
          company_margin_pct?: number | null
          complaint_description?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_explanation?: string | null
          customer_id?: string | null
          customer_latitude?: number | null
          customer_longitude?: number | null
          customer_name?: string
          customer_phone?: string
          delay_category?: string | null
          delay_reason?: string | null
          device_id?: string | null
          distance_charge?: number | null
          distance_km?: number | null
          final_customer_amount?: number | null
          id?: string
          issue: string
          notes?: string | null
          pickup_date?: string | null
          priority?: string
          product_id?: string | null
          product_returned_date?: string | null
          scheduled_at?: string | null
          sent_to_vendor_date?: string | null
          service_charge?: number | null
          sla_hours?: number | null
          status?: string
          technician_observations?: string | null
          ticket_number: string
          updated_at?: string
          vendor_completion_date?: string | null
          vendor_expected_completion?: string | null
          vendor_id?: string | null
          vendor_invoice_amount?: number | null
          vendor_invoice_url?: string | null
          vendor_registration_date?: string | null
          vendor_service_notes?: string | null
          vendor_srn?: string | null
          vendor_ticket_number?: string | null
        }
        Update: {
          additional_service_charge?: number | null
          assigned_to?: string | null
          assignee_name?: string | null
          category?: string
          company_margin_pct?: number | null
          complaint_description?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_explanation?: string | null
          customer_id?: string | null
          customer_latitude?: number | null
          customer_longitude?: number | null
          customer_name?: string
          customer_phone?: string
          delay_category?: string | null
          delay_reason?: string | null
          device_id?: string | null
          distance_charge?: number | null
          distance_km?: number | null
          final_customer_amount?: number | null
          id?: string
          issue?: string
          notes?: string | null
          pickup_date?: string | null
          priority?: string
          product_id?: string | null
          product_returned_date?: string | null
          scheduled_at?: string | null
          sent_to_vendor_date?: string | null
          service_charge?: number | null
          sla_hours?: number | null
          status?: string
          technician_observations?: string | null
          ticket_number?: string
          updated_at?: string
          vendor_completion_date?: string | null
          vendor_expected_completion?: string | null
          vendor_id?: string | null
          vendor_invoice_amount?: number | null
          vendor_invoice_url?: string | null
          vendor_registration_date?: string | null
          vendor_service_notes?: string | null
          vendor_srn?: string | null
          vendor_ticket_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_expenses: {
        Row: {
          amount: number
          approved_by: string | null
          created_at: string
          description: string | null
          distance_km: number | null
          expense_date: string
          expense_type: string
          id: string
          receipt_url: string | null
          status: string
          ticket_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          approved_by?: string | null
          created_at?: string
          description?: string | null
          distance_km?: number | null
          expense_date?: string
          expense_type?: string
          id?: string
          receipt_url?: string | null
          status?: string
          ticket_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          approved_by?: string | null
          created_at?: string
          description?: string | null
          distance_km?: number | null
          expense_date?: string
          expense_type?: string
          id?: string
          receipt_url?: string | null
          status?: string
          ticket_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_expenses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
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
      vendors: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          service_categories: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          service_categories?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          service_categories?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "coordinator" | "technician"
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
      app_role: ["admin", "coordinator", "technician"],
    },
  },
} as const
