import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type ProfileFieldSetting = Database["public"]["Tables"]["profile_field_settings"]["Row"];

export function useProfileSettings(entityType: 'associate' | 'dependent') {
  return useQuery({
    queryKey: ['profile-field-settings', entityType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_field_settings')
        .select('*')
        .eq('entity_type', entityType)
        .eq('active', true)
        .order('display_order');

      if (error) throw error;
      return data as ProfileFieldSetting[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
