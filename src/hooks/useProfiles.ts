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
  maps_url: string | null;
  is_buried: boolean | null;
  is_published: boolean | null;
  is_celebrity: boolean | null;
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
  maps_url?: string;
  is_buried?: boolean;
  is_published?: boolean;
  is_celebrity?: boolean;
}

// Fetch all profiles (for admin) - only regular profiles (not celebrities)
export function useAllProfiles() {
  return useQuery({
    queryKey: ['profiles', 'regular'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or('is_celebrity.is.null,is_celebrity.eq.false')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
  });
}

// Fetch ALL profiles (both regular and celebrities) - for slideshow
export function useAllProfilesIncludingCelebrities() {
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

// Fetch all celebrity profiles
export function useCelebrityProfiles() {
  return useQuery({
    queryKey: ['profiles', 'celebrities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_celebrity', true)
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
      // Generate slug from name if not provided, then make sure it is not taken
      const slug = await findAvailableSlug(formData.slug || generateSlug(formData.name));

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
          maps_url: formData.maps_url || null,
          is_buried: formData.is_buried ?? false,
          is_published: formData.is_published ?? false,
          is_celebrity: formData.is_celebrity ?? false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, formData) => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      if (formData.slug && data.slug !== formData.slug) {
        toast.success(`Đã tạo hồ sơ. Mã "${formData.slug}" đã có người dùng nên hồ sơ được cấp mã "${data.slug}".`);
      } else {
        toast.success('Đã tạo hồ sơ thành công!');
      }
    },
    onError: (error) => {
      console.error('Error creating profile:', error);
      toast.error(isDuplicateSlugError(error) ? 'Mã hồ sơ đã tồn tại, vui lòng thử lại' : 'Lỗi khi tạo hồ sơ');
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
          maps_url: formData.maps_url || null,
          is_buried: formData.is_buried,
          is_published: formData.is_published,
          is_celebrity: formData.is_celebrity,
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
      toast.error(isDuplicateSlugError(error) ? 'Mã hồ sơ này đã được dùng cho hồ sơ khác, vui lòng chọn mã khác' : 'Lỗi khi cập nhật hồ sơ');
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

// Postgres unique violation (profiles.slug is UNIQUE)
function isDuplicateSlugError(error: unknown): boolean {
  return (error as { code?: string } | null)?.code === '23505';
}

// Returns the slug itself, or slug2, slug3... when it is already used by another profile
async function findAvailableSlug(slug: string): Promise<string> {
  const { data, error } = await supabase
    .from('profiles')
    .select('slug')
    .like('slug', `${slug.replace(/[\\%_]/g, '\\$&')}%`);

  if (error) throw error;

  const taken = new Set((data || []).map((p) => p.slug));
  if (!taken.has(slug)) return slug;

  let suffix = 2;
  while (taken.has(`${slug}${suffix}`)) suffix++;
  return `${slug}${suffix}`;
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
