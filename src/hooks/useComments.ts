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
      setError(null);
      console.log('Fetching comments for profileId:', profileId);
      
      if (!profileId) {
        console.log('No profileId provided, skipping fetch');
        setComments([]);
        return;
      }

      // Simplified query - just get all comments for this profile
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
        setError(`Database error: ${error.message}`);
        setComments([]);
        return;
      }
      
      console.log('Fetched comments raw data:', data);
      console.log('Comments count:', data?.length || 0);
      
      // Filter approved and public comments in JavaScript instead of SQL
      const filteredComments = (data || []).filter(comment => {
        const isApproved = comment.is_approved === true || comment.is_approved === null;
        const isPublic = comment.is_public === true || comment.is_public === null;
        return isApproved && isPublic;
      });
      
      console.log('Filtered comments:', filteredComments);
      setComments(filteredComments);
    } catch (err) {
      console.error('fetchComments error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      setError(errorMessage);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  // Add new comment
  const addComment = async (commentData: { name: string; phone: string; message: string }) => {
    try {
      console.log('Adding comment:', { profileId, commentData });
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          author_name: commentData.name,
          author_email: commentData.phone, // Using phone as email for now
          content: commentData.message,
          profile_id: profileId,
          is_approved: true, // Auto-approve for now
          is_public: true,   // Make public by default
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      console.log('Comment inserted successfully:', data);
      
      // Refresh comments to show the new one immediately
      await fetchComments();
      
      return { success: true, data };
    } catch (err) {
      console.error('addComment error:', err);
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