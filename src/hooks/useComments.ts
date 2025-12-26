import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Comment {
  id: string;
  author_name: string;
  author_email?: string;
  content: string;
  profile_id: string;
  profile_name?: string;
  created_at: string;
  updated_at: string;
}

// Get profile names for comments
export const useProfileNames = () => {
  return useQuery({
    queryKey: ["profile-names"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name");

      if (error) {
        console.error("Error fetching profile names:", error);
        throw error;
      }

      return new Map(data?.map((p: any) => [p.id, p.name]) || []);
    },
  });
};

// Get all comments with profile information
export const useAllComments = () => {
  return useQuery({
    queryKey: ["comments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching comments:", error);
        throw error;
      }

      return (data || []) as Comment[];
    },
  });
};

// Get comments for a specific profile (public-facing hook)
export const useComments = (profileId: string) => {
  const { data: comments = [], isLoading: loading, error } = useProfileComments(profileId);
  const addComment = useCreateComment();

  return {
    comments,
    loading,
    error,
    addComment: async (commentData: { name: string; phone: string; message: string }) => {
      if (!profileId) throw new Error("Profile ID is required");
      
      return addComment.mutateAsync({
        profile_id: profileId,
        author_name: commentData.name,
        author_email: commentData.phone, // Store phone in email field for now
        content: commentData.message,
      });
    },
  };
};

// Get comments for a specific profile
export const useProfileComments = (profileId: string) => {
  return useQuery({
    queryKey: ["comments", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("profile_id", profileId)
        .eq("is_public", true)   // Only show public comments
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching profile comments:", error);
        throw error;
      }

      return (data || []) as Comment[];
    },
    enabled: !!profileId,
  });
};

// Create a new comment
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentData: {
      profile_id: string;
      author_name: string;
      author_email?: string;
      content: string;
    }) => {
      const { data, error } = await supabase
        .from("comments")
        .insert([{
          profile_id: commentData.profile_id,
          author_name: commentData.author_name,
          author_email: commentData.author_email,
          content: commentData.content,
          is_approved: true, // Auto-approve all comments
          is_public: true,   // Make all comments public
        }])
        .select()
        .single();

      if (error) {
        console.error("Error creating comment:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      toast.success("Đã gửi lời chia buồn thành công");
    },
    onError: (error) => {
      console.error("Error creating comment:", error);
      toast.error("Có lỗi xảy ra khi gửi lời chia buồn");
    },
  });
};

// Delete a comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) {
        console.error("Error deleting comment:", error);
        throw error;
      }

      return commentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      toast.success("Bình luận đã được xóa");
    },
    onError: (error) => {
      console.error("Error deleting comment:", error);
      toast.error("Có lỗi xảy ra khi xóa bình luận");
    },
  });
};

// Get comment statistics
export const useCommentStats = () => {
  return useQuery({
    queryKey: ["comment-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("created_at");

      if (error) {
        console.error("Error fetching comment stats:", error);
        throw error;
      }

      const stats = {
        total: data?.length || 0,
        dailyStats: {} as Record<string, number>,
      };

      // Calculate daily stats (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      });

      last7Days.forEach(date => {
        stats.dailyStats[date] = data?.filter((c: any) => 
          c.created_at.startsWith(date)
        ).length || 0;
      });

      return stats;
    },
  });
};