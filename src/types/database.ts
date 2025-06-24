// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          supabase_uid: string;
          email: string;
          display_name: string | null;
          age: number | null;
          gender: 'male' | 'female' | 'other' | null;
          height: number | null; // in cm
          weight: number | null; // in kg
          ethnicity: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supabase_uid: string;
          email: string;
          display_name?: string | null;
          age?: number | null;
          gender?: 'male' | 'female' | 'other' | null;
          height?: number | null;
          weight?: number | null;
          ethnicity?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supabase_uid?: string;
          email?: string;
          display_name?: string | null;
          age?: number | null;
          gender?: 'male' | 'female' | 'other' | null;
          height?: number | null;
          weight?: number | null;
          ethnicity?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      medical_conditions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          diagnosed_date: string;
          status: 'active' | 'resolved' | 'managed';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          diagnosed_date: string;
          status: 'active' | 'resolved' | 'managed';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          diagnosed_date?: string;
          status?: 'active' | 'resolved' | 'managed';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      vaccinations: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          date: string;
          next_due: string | null;
          location: string | null;
          batch_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          date: string;
          next_due?: string | null;
          location?: string | null;
          batch_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          date?: string;
          next_due?: string | null;
          location?: string | null;
          batch_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      biomarkers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          value: number;
          unit: string;
          category: 'cardiovascular' | 'metabolic' | 'hormonal' | 'inflammatory' | 'nutritional';
          trend: 'improving' | 'stable' | 'declining';
          risk_level: 'low' | 'medium' | 'high';
          recorded_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          value: number;
          unit: string;
          category: 'cardiovascular' | 'metabolic' | 'hormonal' | 'inflammatory' | 'nutritional';
          trend?: 'improving' | 'stable' | 'declining';
          risk_level?: 'low' | 'medium' | 'high';
          recorded_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          value?: number;
          unit?: string;
          category?: 'cardiovascular' | 'metabolic' | 'hormonal' | 'inflammatory' | 'nutritional';
          trend?: 'improving' | 'stable' | 'declining';
          risk_level?: 'low' | 'medium' | 'high';
          recorded_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      device_data: {
        Row: {
          id: string;
          user_id: string;
          device_type: 'whoop' | 'apple_watch' | 'eight_sleep' | 'smart_toothbrush' | 'smart_toilet';
          device_name: string;
          metrics: any; // JSON object
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          device_type: 'whoop' | 'apple_watch' | 'eight_sleep' | 'smart_toothbrush' | 'smart_toilet';
          device_name: string;
          metrics: any;
          timestamp: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          device_type?: 'whoop' | 'apple_watch' | 'eight_sleep' | 'smart_toothbrush' | 'smart_toilet';
          device_name?: string;
          metrics?: any;
          timestamp?: string;
          created_at?: string;
        };
      };
      lab_results: {
        Row: {
          id: string;
          user_id: string;
          test_name: string;
          value: string;
          unit: string;
          reference_range: string;
          date: string;
          category: 'blood' | 'urine' | 'imaging' | 'other';
          status: 'normal' | 'high' | 'low' | 'critical';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          test_name: string;
          value: string;
          unit: string;
          reference_range: string;
          date: string;
          category: 'blood' | 'urine' | 'imaging' | 'other';
          status: 'normal' | 'high' | 'low' | 'critical';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          test_name?: string;
          value?: string;
          unit?: string;
          reference_range?: string;
          date?: string;
          category?: 'blood' | 'urine' | 'imaging' | 'other';
          status?: 'normal' | 'high' | 'low' | 'critical';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 