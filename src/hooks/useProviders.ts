import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ProviderType = Database['public']['Enums']['provider_type'];

export interface Provider {
  id: string;
  name: string;
  avatar_url: string | null;
  governorate: string | null;
  address: string | null;
  rating: number | null;
  review_count: number | null;
  specialization: string | null;
  consultation_fee: number | null;
  phone: string | null;
  provider_type: ProviderType;
  is_verified: boolean | null;
  bio: string | null;
  working_hours: any;
}

export function useProviders(providerType: ProviderType) {
  return useQuery({
    queryKey: ['providers', providerType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('provider_type', providerType)
        .eq('is_verified', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data as Provider[];
    },
  });
}

export function useAllProviders() {
  return useQuery({
    queryKey: ['providers', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('is_verified', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data as Provider[];
    },
  });
}
