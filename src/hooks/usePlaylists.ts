import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  slide_duration: number;
  profile_ids: string[];
  auto_play: boolean;
  loop: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePlaylistData {
  name: string;
  description?: string;
  slide_duration: number;
  profile_ids: string[];
  auto_play: boolean;
  loop: boolean;
}

export const usePlaylists = () => {
  return useQuery({
    queryKey: ["playlists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Playlist[];
    },
  });
};

export const usePlaylist = (id: string | null) => {
  return useQuery({
    queryKey: ["playlist", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Playlist;
    },
    enabled: !!id,
  });
};

export const useCreatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playlistData: CreatePlaylistData) => {
      const { data, error } = await supabase
        .from("playlists")
        .insert([playlistData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      toast.success("Playlist đã được tạo thành công!");
    },
    onError: (error) => {
      console.error("Error creating playlist:", error);
      toast.error("Lỗi khi tạo playlist. Vui lòng thử lại.");
    },
  });
};

export const useUpdatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<CreatePlaylistData>) => {
      const { data, error } = await supabase
        .from("playlists")
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      toast.success("Playlist đã được cập nhật!");
    },
    onError: (error) => {
      console.error("Error updating playlist:", error);
      toast.error("Lỗi khi cập nhật playlist. Vui lòng thử lại.");
    },
  });
};

export const useDeletePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("playlists")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      toast.success("Playlist đã được xóa!");
    },
    onError: (error) => {
      console.error("Error deleting playlist:", error);
      toast.error("Lỗi khi xóa playlist. Vui lòng thử lại.");
    },
  });
};