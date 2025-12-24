import { MessageSquare, Eye, Trash2, MoreHorizontal, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";
import { DataTable, Column, FilterOption } from "@/components/ui/data-table";
import { format } from "date-fns";

interface Comment {
  id: string;
  author_name: string;
  author_email?: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  profile_name: string;
  profile_id: string;
  created_at: string;
  updated_at: string;
}

// Mock data - thay thế bằng hook thực tế
const mockComments: Comment[] = [
  {
    id: "1",
    author_name: "Nguyễn Văn A",
    author_email: "nguyenvana@email.com",
    content: "Chúc bác an nghỉ. Bác là người tốt, luôn giúp đỡ mọi người trong xóm.",
    status: "approved",
    profile_name: "Trần Thị B",
    profile_id: "profile-1",
    created_at: "2024-12-20T10:30:00Z",
    updated_at: "2024-12-20T11:00:00Z",
  },
  {
    id: "2",
    author_name: "Lê Thị C",
    author_email: "lethic@email.com",
    content: "Tôi sẽ nhớ mãi những kỷ niệm đẹp với cô. Cô đã dạy tôi rất nhiều điều.",
    status: "pending",
    profile_name: "Phạm Văn D",
    profile_id: "profile-2",
    created_at: "2024-12-21T14:15:00Z",
    updated_at: "2024-12-21T14:15:00Z",
  },
  {
    id: "3",
    author_name: "Hoàng Minh E",
    content: "Spam comment here...",
    status: "rejected",
    profile_name: "Trần Thị B",
    profile_id: "profile-1",
    created_at: "2024-12-22T09:45:00Z",
    updated_at: "2024-12-22T10:00:00Z",
  },
];

export const CommentsTab = () => {
  const [comments] = useState<Comment[]>(mockComments);
  const [isLoading] = useState(false);

  const handleApprove = async (id: string) => {
    console.log("Approve comment:", id);
    // Implement approve logic
  };

  const handleReject = async (id: string) => {
    console.log("Reject comment:", id);
    // Implement reject logic
  };

  const handleDelete = async (id: string) => {
    console.log("Delete comment:", id);
    // Implement delete logic
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: Comment["status"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã duyệt
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-sm">
            <XCircle className="w-3 h-3 mr-1" />
            Từ chối
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-sm">
            <Clock className="w-3 h-3 mr-1" />
            Chờ duyệt
          </Badge>
        );
    }
  };

  // Define table columns
  const columns: Column<Comment>[] = [
    {
      key: "index",
      header: "#",
      render: (_, index) => (
        <span className="font-medium text-slate-600 dark:text-slate-400">
          {index + 1}
        </span>
      ),
      sortable: false,
      searchable: false,
    },
    {
      key: "author_name",
      header: "Người bình luận",
      render: (comment) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-slate-100">
            {comment.author_name}
          </div>
          {comment.author_email && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {comment.author_email}
            </div>
          )}
        </div>
      ),
      sortable: true,
      searchable: true,
    },
    {
      key: "content",
      header: "Nội dung",
      render: (comment) => (
        <div className="max-w-xs">
          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
            {comment.content}
          </p>
        </div>
      ),
      sortable: false,
      searchable: true,
    },
    {
      key: "profile_name",
      header: "Trang tưởng niệm",
      render: (comment) => (
        <div className="text-sm text-slate-700 dark:text-slate-300">
          {comment.profile_name}
        </div>
      ),
      sortable: true,
      searchable: true,
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (comment) => getStatusBadge(comment.status),
      sortable: true,
      searchable: false,
    },
    {
      key: "created_at",
      header: "Ngày tạo",
      render: (comment) => (
        <span className="text-slate-600 dark:text-slate-400 text-sm">
          {formatDate(comment.created_at)}
        </span>
      ),
      sortable: true,
      searchable: false,
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (comment) => (
        <div className="flex items-center justify-end gap-1">
          {comment.status === "pending" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950"
                onClick={() => handleApprove(comment.id)}
                aria-label="Duyệt bình luận"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                onClick={() => handleReject(comment.id)}
                aria-label="Từ chối bình luận"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-50 dark:hover:bg-slate-800">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer">
                <Eye className="h-4 w-4 mr-2" />
                Xem chi tiết
              </DropdownMenuItem>
              {comment.status === "pending" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-green-600"
                    onSelect={() => handleApprove(comment.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Duyệt bình luận
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600"
                    onSelect={() => handleReject(comment.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Từ chối
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa bình luận
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa bình luận</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc muốn xóa bình luận này? 
                      Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(comment.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Xóa vĩnh viễn
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      sortable: false,
      searchable: false,
    },
  ];

  // Define filters
  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Trạng thái",
      options: [
        { value: "pending", label: "Chờ duyệt" },
        { value: "approved", label: "Đã duyệt" },
        { value: "rejected", label: "Từ chối" },
      ],
    },
  ];

  // Empty state component
  const emptyState = (
    <div>
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
        <MessageSquare className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Chưa có bình luận nào</h3>
      <p className="text-slate-500 dark:text-slate-400">Các bình luận từ người dùng sẽ hiển thị ở đây</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Quản lý Bình luận
          </h1>
          <p className="text-muted-foreground text-sm">Duyệt và quản lý bình luận từ người dùng</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Tổng số</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{comments.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Chờ duyệt</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {comments.filter(c => c.status === "pending").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Đã duyệt</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {comments.filter(c => c.status === "approved").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Từ chối</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {comments.filter(c => c.status === "rejected").length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        data={comments}
        columns={columns}
        searchPlaceholder="Tìm kiếm theo tên, email hoặc nội dung..."
        filters={filters}
        defaultPageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        emptyState={emptyState}
        loading={isLoading}
      />
    </div>
  );
};