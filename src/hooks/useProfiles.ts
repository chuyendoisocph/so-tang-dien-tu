import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  name: string;
  slug: string | null;
  birth_date: string | null;
  death_date: string | null;
  biography: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  is_published: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProfileFormData {
  name: string;
  slug?: string;
  birth_date?: string;
  death_date?: string;
  biography?: string;
  avatar_url?: string;
  cover_url?: string;
  is_published?: boolean;
}

// Fetch all profiles (for admin)
export function useAllProfiles() {
  return useQuery({
    queryKey: ['profiles', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });
}

// Fetch a single profile by ID
export function useProfile(id: string | null) {
  return useQuery({
    queryKey: ['profiles', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!id,
  });
}

// Create a new profile
export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: ProfileFormData) => {
      // Generate slug from name if not provided
      const slug = formData.slug || generateSlug(formData.name);

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          name: formData.name,
          slug,
          birth_date: formData.birth_date || null,
          death_date: formData.death_date || null,
          biography: formData.biography || null,
          avatar_url: formData.avatar_url || null,
          cover_url: formData.cover_url || null,
          is_published: formData.is_published ?? false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Đã tạo hồ sơ thành công!');
    },
    onError: (error) => {
      console.error('Error creating profile:', error);
      toast.error('Lỗi khi tạo hồ sơ');
    },
  });
}

// Update an existing profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: ProfileFormData }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          slug: formData.slug,
          birth_date: formData.birth_date || null,
          death_date: formData.death_date || null,
          biography: formData.biography || null,
          avatar_url: formData.avatar_url || null,
          cover_url: formData.cover_url || null,
          is_published: formData.is_published,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Đã cập nhật hồ sơ thành công!');
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast.error('Lỗi khi cập nhật hồ sơ');
    },
  });
}

// Delete a profile
export function useDeleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Đã xóa hồ sơ thành công!');
    },
    onError: (error) => {
      console.error('Error deleting profile:', error);
      toast.error('Lỗi khi xóa hồ sơ');
    },
  });
}

// Helper function to generate slug from name
function generateSlug(name: string): string {
  const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
  const initials = name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 3);
  return `${initials}${timestamp}`;
}
