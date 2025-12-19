import { useAdminComments } from '@/hooks/useAdminComments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Check, X, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const CommentManagement = () => {
  const { comments, loading, approveComment, rejectComment, deleteComment } = useAdminComments();
  const { toast } = useToast();

  const handleApprove = async (commentId: string) => {
    const result = await approveComment(commentId);
    if (result.success) {
      toast({
        title: "Thành công",
        description: "Đã duyệt bình luận",
      });
    } else {
      toast({
        title: "Lỗi",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleReject = async (commentId: string) => {
    const result = await rejectComment(commentId);
    if (result.success) {
      toast({
        title: "Thành công",
        description: "Đã từ chối bình luận",
      });
    } else {
      toast({
        title: "Lỗi",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (commentId: string) => {
    const result = await deleteComment(commentId);
    if (result.success) {
      toast({
        title: "Thành công",
        description: "Đã xóa bình luận",
      });
    } else {
      toast({
        title: "Lỗi",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (comment: any) => {
    if (!comment.is_approved && comment.is_public) {
      return <Badge variant="secondary">Chờ duyệt</Badge>;
    }
    if (comment.is_approved && comment.is_public) {
      return <Badge variant="default">Đã duyệt</Badge>;
    }
    if (!comment.is_approved && !comment.is_public) {
      return <Badge variant="destructive">Đã từ chối</Badge>;
    }
    return <Badge variant="outline">Ẩn</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý bình luận</h2>
        <div className="text-sm text-muted-foreground">
          Tổng cộng: {comments.length} bình luận
        </div>
      </div>

      {comments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Chưa có bình luận nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.map((comment: any) => (
            <Card key={comment.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{comment.author_name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{comment.author_email || 'Không có email'}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </span>
                    </div>
                    {comment.profiles && (
                      <div className="text-sm text-muted-foreground">
                        Trang: <span className="font-medium">{comment.profiles.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(comment)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm leading-relaxed whitespace-pre-wrap mb-4">
                  {comment.content}
                </p>
                
                <div className="flex items-center gap-2">
                  {!comment.is_approved && comment.is_public && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleApprove(comment.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Duyệt
                    </Button>
                  )}
                  
                  {comment.is_approved && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(comment.id)}
                    >
                      {comment.is_public ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Ẩn
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Hiện
                        </>
                      )}
                    </Button>
                  )}
                  
                  {!comment.is_approved && comment.is_public && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(comment.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Từ chối
                    </Button>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Xóa
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(comment.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Xóa
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};