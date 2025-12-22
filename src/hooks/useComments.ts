import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Comment = Tables<'comments'>;
export type CommentInsert = TablesInsert<'comments'>;

export const useComments = (profileId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments for a profile
  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('profile_id', profileId)
        .eq('is_approved', true)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  // Add new comment
  const addComment = async (commentData: { name: string; phone: string; message: string }) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          author_name: commentData.name,
          author_email: commentData.phone, // Using phone as email for now
          content: commentData.message,
          profile_id: profileId,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Don't add to local state since it needs approval
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi bình luận';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    if (profileId) {
      fetchComments();
    }
  }, [profileId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!profileId) return;

    const channel = supabase
      .channel('comments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `profile_id=eq.${profileId}`,
        },
        () => {
          fetchComments(); // Refetch when comments change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId]);

  return {
    comments,
    loading,
    error,
    addComment,
    refetch: fetchComments,
  };
};