import { supabase } from '../config/supabase';
import { Database } from '../types/database';
import { UserProfile, Biomarker, LabResult, DeviceData, MedicalCondition, Vaccination } from '../types';

type Tables = Database['public']['Tables'];

export class DataService {
  // Profile operations
  static async createProfile(userId: string, email: string, displayName?: string) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        supabase_uid: userId,
        email,
        display_name: displayName,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getProfile(userId: string): Promise<Tables['profiles']['Row'] | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('supabase_uid', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
    return data;
  }

  static async updateProfile(userId: string, updates: Partial<Tables['profiles']['Update']>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('supabase_uid', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Biomarkers operations
  static async getBiomarkers(userId: string): Promise<Tables['biomarkers']['Row'][]> {
    const { data, error } = await supabase
      .from('biomarkers')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async addBiomarker(userId: string, biomarker: Omit<Tables['biomarkers']['Insert'], 'user_id'>) {
    const { data, error } = await supabase
      .from('biomarkers')
      .insert({
        ...biomarker,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateBiomarker(id: string, updates: Tables['biomarkers']['Update']) {
    const { data, error } = await supabase
      .from('biomarkers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Medical conditions operations
  static async getMedicalConditions(userId: string): Promise<Tables['medical_conditions']['Row'][]> {
    const { data, error } = await supabase
      .from('medical_conditions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async addMedicalCondition(userId: string, condition: Omit<Tables['medical_conditions']['Insert'], 'user_id'>) {
    const { data, error } = await supabase
      .from('medical_conditions')
      .insert({
        ...condition,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Vaccinations operations
  static async getVaccinations(userId: string): Promise<Tables['vaccinations']['Row'][]> {
    const { data, error } = await supabase
      .from('vaccinations')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async addVaccination(userId: string, vaccination: Omit<Tables['vaccinations']['Insert'], 'user_id'>) {
    const { data, error } = await supabase
      .from('vaccinations')
      .insert({
        ...vaccination,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Lab results operations
  static async getLabResults(userId: string): Promise<Tables['lab_results']['Row'][]> {
    const { data, error } = await supabase
      .from('lab_results')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async addLabResult(userId: string, labResult: Omit<Tables['lab_results']['Insert'], 'user_id'>) {
    const { data, error } = await supabase
      .from('lab_results')
      .insert({
        ...labResult,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Device data operations
  static async getDeviceData(userId: string, deviceType?: string): Promise<Tables['device_data']['Row'][]> {
    let query = supabase
      .from('device_data')
      .select('*')
      .eq('user_id', userId);

    if (deviceType) {
      query = query.eq('device_type', deviceType);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async addDeviceData(userId: string, deviceData: Omit<Tables['device_data']['Insert'], 'user_id'>) {
    const { data, error } = await supabase
      .from('device_data')
      .insert({
        ...deviceData,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Utility functions
  static async initializeUserData(userId: string, email: string, displayName?: string) {
    // Create profile if it doesn't exist
    let profile = await this.getProfile(userId);
    
    if (!profile) {
      profile = await this.createProfile(userId, email, displayName);
    }

    return profile;
  }

  // Real-time subscriptions
  static subscribeToBiomarkers(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('biomarkers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'biomarkers',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  static subscribeToProfile(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `supabase_uid=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }
} 