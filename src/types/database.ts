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
          full_name: string
          email: string | null
          role: string | null
          avatar_url: string | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name?: string
          email?: string | null
          role?: string | null
          avatar_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string | null
          role?: string | null
          avatar_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      brands: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          overview: string | null
          progress: number
          health_score: number
          revenue_placeholder: Json
          priority: number
          is_active: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          type?: string
          overview?: string | null
          progress?: number
          health_score?: number
          revenue_placeholder?: Json
          priority?: number
          is_active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          overview?: string | null
          progress?: number
          health_score?: number
          revenue_placeholder?: Json
          priority?: number
          is_active?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          brand_id: string | null
          title: string
          description: string | null
          status: string
          priority: string
          category: string
          due_date: string | null
          completed_at: string | null
          estimated_minutes: number
          actual_minutes: number | null
          location: string | null
          repeat: string | null
          notes: string | null
          tags: string[]
          is_ai_generated: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          brand_id?: string | null
          title: string
          description?: string | null
          status?: string
          priority?: string
          category?: string
          due_date?: string | null
          completed_at?: string | null
          estimated_minutes?: number
          actual_minutes?: number | null
          location?: string | null
          repeat?: string | null
          notes?: string | null
          tags?: string[]
          is_ai_generated?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          brand_id?: string | null
          title?: string
          description?: string | null
          status?: string
          priority?: string
          category?: string
          due_date?: string | null
          completed_at?: string | null
          estimated_minutes?: number
          actual_minutes?: number | null
          location?: string | null
          repeat?: string | null
          notes?: string | null
          tags?: string[]
          is_ai_generated?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          brand_id: string | null
          name: string
          description: string | null
          status: string
          progress: number
          target_date: string | null
          start_date: string | null
          completed_at: string | null
          roadmap: Json
          files: Json
          notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          brand_id?: string | null
          name: string
          description?: string | null
          status?: string
          progress?: number
          target_date?: string | null
          start_date?: string | null
          completed_at?: string | null
          roadmap?: Json
          files?: Json
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          brand_id?: string | null
          name?: string
          description?: string | null
          status?: string
          progress?: number
          target_date?: string | null
          start_date?: string | null
          completed_at?: string | null
          roadmap?: Json
          files?: Json
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      learning_topics: {
        Row: {
          id: string
          user_id: string
          category: string
          topic: string
          description: string | null
          progress: number
          status: string
          study_hours: number
          target_hours: number
          notes: string | null
          resources: Json
          priority: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          category: string
          topic: string
          description?: string | null
          progress?: number
          status?: string
          study_hours?: number
          target_hours?: number
          notes?: string | null
          resources?: Json
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          topic?: string
          description?: string | null
          progress?: number
          status?: string
          study_hours?: number
          target_hours?: number
          notes?: string | null
          resources?: Json
          priority?: number
          created_at?: string
          updated_at?: string
        }
      }
      trades: {
        Row: {
          id: string
          user_id: string
          trade_date: string
          symbol: string
          trade_type: string
          quantity: number
          entry_price: number
          exit_price: number | null
          profit_loss: number
          outcome: string
          strategy: string | null
          setup_reason: string | null
          exit_reason: string | null
          notes: string | null
          tags: string[]
          risk_reward_ratio: number | null
          position_size: number | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          trade_date?: string
          symbol: string
          trade_type: string
          quantity: number
          entry_price: number
          exit_price?: number | null
          profit_loss?: number
          outcome?: string
          strategy?: string | null
          setup_reason?: string | null
          exit_reason?: string | null
          notes?: string | null
          tags?: string[]
          risk_reward_ratio?: number | null
          position_size?: number | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trade_date?: string
          symbol?: string
          trade_type?: string
          quantity?: number
          entry_price?: number
          exit_price?: number | null
          profit_loss?: number
          outcome?: string
          strategy?: string | null
          setup_reason?: string | null
          exit_reason?: string | null
          notes?: string | null
          tags?: string[]
          risk_reward_ratio?: number | null
          position_size?: number | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      ideas: {
        Row: {
          id: string
          user_id: string
          brand_id: string | null
          type: string
          title: string
          detail: string | null
          status: string
          priority: string | null
          impact: string | null
          notes: string | null
          tags: string[]
          resolution: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          brand_id?: string | null
          type?: string
          title: string
          detail?: string | null
          status?: string
          priority?: string | null
          impact?: string | null
          notes?: string | null
          tags?: string[]
          resolution?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          brand_id?: string | null
          type?: string
          title?: string
          detail?: string | null
          status?: string
          priority?: string | null
          impact?: string | null
          notes?: string | null
          tags?: string[]
          resolution?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      daily_tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          schedule: string
          custom_days: number[]
          status: string
          completed_today: boolean
          completion_date: string | null
          streak_count: number
          best_streak: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          title: string
          schedule?: string
          custom_days?: number[]
          status?: string
          completed_today?: boolean
          completion_date?: string | null
          streak_count?: number
          best_streak?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          schedule?: string
          custom_days?: number[]
          status?: string
          completed_today?: boolean
          completion_date?: string | null
          streak_count?: number
          best_streak?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      kpis: {
        Row: {
          id: string
          user_id: string
          metric_name: string
          metric_type: string
          value: number
          target: number | null
          unit: string | null
          category: string
          period: string
          trend: string
          trend_percentage: number
          metadata: Json
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          metric_name: string
          metric_type?: string
          value?: number
          target?: number | null
          unit?: string | null
          category?: string
          period?: string
          trend?: string
          trend_percentage?: number
          metadata?: Json
          recorded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          metric_name?: string
          metric_type?: string
          value?: number
          target?: number | null
          unit?: string | null
          category?: string
          period?: string
          trend?: string
          trend_percentage?: number
          metadata?: Json
          recorded_at?: string
          created_at?: string
        }
      }
      ai_sessions: {
        Row: {
          id: string
          user_id: string
          session_type: string
          messages: Json
          context: Json
          actions: Json
          summary: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          session_type?: string
          messages?: Json
          context?: Json
          actions?: Json
          summary?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_type?: string
          messages?: Json
          context?: Json
          actions?: Json
          summary?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      daily_reports: {
        Row: {
          id: string
          user_id: string
          report_date: string
          report_type: string
          summary: string | null
          tasks_completed: number
          tasks_pending: number
          learning_completed: boolean
          learning_hours: number
          productivity_score: number
          challenges: string[]
          achievements: string[]
          ai_insights: Json
          recommendations: Json
          time_allocation: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          report_date?: string
          report_type?: string
          summary?: string | null
          tasks_completed?: number
          tasks_pending?: number
          learning_completed?: boolean
          learning_hours?: number
          productivity_score?: number
          challenges?: string[]
          achievements?: string[]
          ai_insights?: Json
          recommendations?: Json
          time_allocation?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          report_date?: string
          report_type?: string
          summary?: string | null
          tasks_completed?: number
          tasks_pending?: number
          learning_completed?: boolean
          learning_hours?: number
          productivity_score?: number
          challenges?: string[]
          achievements?: string[]
          ai_insights?: Json
          recommendations?: Json
          time_allocation?: Json
          created_at?: string
        }
      }
      time_allocations: {
        Row: {
          id: string
          user_id: string
          allocation_date: string
          category: string
          hours: number
          percentage: number
          description: string | null
          tasks_completed: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          allocation_date?: string
          category: string
          hours?: number
          percentage?: number
          description?: string | null
          tasks_completed?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          allocation_date?: string
          category?: string
          hours?: number
          percentage?: number
          description?: string | null
          tasks_completed?: number
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

// Type exports for convenience
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Brand = Database['public']['Tables']['brands']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type LearningTopic = Database['public']['Tables']['learning_topics']['Row']
export type Trade = Database['public']['Tables']['trades']['Row']
export type Idea = Database['public']['Tables']['ideas']['Row']
export type DailyTask = Database['public']['Tables']['daily_tasks']['Row']
export type KPI = Database['public']['Tables']['kpis']['Row']
export type AISession = Database['public']['Tables']['ai_sessions']['Row']
export type DailyReport = Database['public']['Tables']['daily_reports']['Row']
export type TimeAllocation = Database['public']['Tables']['time_allocations']['Row']
