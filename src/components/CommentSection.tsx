import { useState } from 'react';
import { useComments } from '@/hooks/useComments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CommentSectionProps {
  profileId: string;
}

export const CommentSection = ({ profileId }: CommentSectionProps) => {
  const { comments, loading, addComment } = useComments(profileId);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    author_name: '',
    author_email: '',
    content: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.author_name.trim() || !formData.content.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ tên và nội dung bình luận",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    
    const result = await addComment({
      author_name: formData.author_name.trim(),
      author_email: formData.author_email.trim() || null,
      content: formData.content.trim(),
    });

    if (result.success) {
      toast({
        title: "Thành công",
        description: "Bình luận của bạn đã được gửi và đang chờ duyệt",
      });
      setFormData({ author_name: '', author_email: '', content: '' });
    } else {
      toast({
        title: "Lỗi",
        description: result.error || "Có lỗi xảy ra khi gửi bình luận",
        variant: "destructive",
      });
    }
    
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Để lại lời nhắn</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Tên của bạn *"
                value={formData.author_name}
                onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                required
              />
              <Input
                type="email"
                placeholder="Email (tùy chọn)"
                value={formData.author_email}
                onChange={(e) => setFormData(prev => ({ ...prev, author_email: e.target.value }))}
              />
            </div>
            <Textarea
              placeholder="Chia sẻ kỷ niệm, lời tri ân hoặc những điều bạn muốn nói..."
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              required
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Đang gửi...' : 'Gửi lời nhắn'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Lời nhắn ({comments.length})
        </h3>
        
        {loading ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Chưa có lời nhắn nào. Hãy là người đầu tiên chia sẻ kỷ niệm.
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{comment.author_name}</h4>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at!), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};