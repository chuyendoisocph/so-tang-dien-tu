import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Comment {
  id: string;
  author_name: string;
  author_email?: string;
  author_phone?: string;
  author_relationship?: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  profile_id: string;
  profile_name?: string;
  ip_address?: string;
  user_agent?: string;
  location?: string;
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

      return (data || []).map((comment: any) => ({
        ...comment,
        status: comment.status || (comment.is_approved ? "approved" : "pending")
      })) as Comment[];
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
        author_phone: commentData.phone,
        content: commentData.message,
        status: "pending" as const,
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
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching profile comments:", error);
        throw error;
      }

      // Filter and transform comments
      return (data || [])
        .filter((comment: any) => {
          // Check if comment is approved using either status or is_approved field
          return comment.status === "approved" || comment.is_approved === true;
        })
        .map((comment: any) => ({
          ...comment,
          status: comment.status || (comment.is_approved ? "approved" : "pending")
        })) as Comment[];
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
      author_phone?: string;
      author_relationship?: string;
      content: string;
      status: "pending" | "approved" | "rejected";
      ip_address?: string;
      user_agent?: string;
      location?: string;
    }) => {
      const { data, error } = await supabase
        .from("comments")
        .insert([{
          ...commentData,
          status: "pending", // All new comments start as pending
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
      toast.success("Bình luận đã được gửi và đang chờ duyệt");
    },
    onError: (error) => {
      console.error("Error creating comment:", error);
      toast.error("Có lỗi xảy ra khi gửi bình luận");
    },
  });
};

// Approve a comment
export const useApproveComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { data, error } = await supabase
        .from("comments")
        .update({ 
          status: "approved",
          updated_at: new Date().toISOString()
        })
        .eq("id", commentId)
        .select()
        .single();

      if (error) {
        console.error("Error approving comment:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      toast.success("Bình luận đã được duyệt");
    },
    onError: (error) => {
      console.error("Error approving comment:", error);
      toast.error("Có lỗi xảy ra khi duyệt bình luận");
    },
  });
};

// Reject a comment
export const useRejectComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { data, error } = await supabase
        .from("comments")
        .update({ 
          status: "rejected",
          updated_at: new Date().toISOString()
        })
        .eq("id", commentId)
        .select()
        .single();

      if (error) {
        console.error("Error rejecting comment:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      toast.success("Bình luận đã bị từ chối");
    },
    onError: (error) => {
      console.error("Error rejecting comment:", error);
      toast.error("Có lỗi xảy ra khi từ chối bình luận");
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

// Bulk approve comments
export const useBulkApproveComments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentIds: string[]) => {
      const { data, error } = await supabase
        .from("comments")
        .update({ 
          status: "approved",
          updated_at: new Date().toISOString()
        })
        .in("id", commentIds)
        .select();

      if (error) {
        console.error("Error bulk approving comments:", error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      toast.success(`Đã duyệt ${data?.length || 0} bình luận`);
    },
    onError: (error) => {
      console.error("Error bulk approving comments:", error);
      toast.error("Có lỗi xảy ra khi duyệt hàng loạt");
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
        .select("status, author_relationship, location, created_at");

      if (error) {
        console.error("Error fetching comment stats:", error);
        throw error;
      }

      const stats = {
        total: data?.length || 0,
        pending: data?.filter((c: any) => c.status === "pending").length || 0,
        approved: data?.filter((c: any) => c.status === "approved").length || 0,
        rejected: data?.filter((c: any) => c.status === "rejected").length || 0,
        relationships: {} as Record<string, number>,
        locations: {} as Record<string, number>,
        dailyStats: {} as Record<string, number>,
      };

      // Calculate relationship stats
      data?.forEach((comment: any) => {
        if (comment.author_relationship) {
          stats.relationships[comment.author_relationship] = 
            (stats.relationships[comment.author_relationship] || 0) + 1;
        }
      });

      // Calculate location stats
      data?.forEach((comment: any) => {
        if (comment.location) {
          const city = comment.location.split(',')[0].trim();
          stats.locations[city] = (stats.locations[city] || 0) + 1;
        }
      });

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