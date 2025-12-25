import { MessageSquare, Eye, Trash2, MoreHorizontal, Loader2, CheckCircle, XCircle, Clock, Download, BarChart3, TrendingUp, Users, Calendar } from "lucide-react";
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
import { 
  useAllComments, 
  useCommentStats, 
  useApproveComment, 
  useRejectComment, 
  useDeleteComment,
  useProfileNames,
  Comment 
} from "@/hooks/useComments";

export const CommentsTab = () => {
  const { data: comments = [], isLoading, error } = useAllComments();
  const { data: profileNames } = useProfileNames();
  const { data: stats } = useCommentStats();
  const approveComment = useApproveComment();
  const rejectComment = useRejectComment();
  const deleteComment = useDeleteComment();

  // Transform comments to include profile names
  const commentsWithProfiles = comments.map((comment: any) => ({
    ...comment,
    profile_name: profileNames?.get(comment.profile_id) || "Unknown Profile"
  }));

  const handleApprove = async (id: string) => {
    try {
      await approveComment.mutateAsync(id);
    } catch (error) {
      console.error("Error approving comment:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectComment.mutateAsync(id);
    } catch (error) {
      console.error("Error rejecting comment:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteComment.mutateAsync(id);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleExportData = () => {
    // Export comments data to CSV
    const csvData = comments.map(comment => ({
      'Tên': comment.author_name,
      'Email': comment.author_email || '',
      'Điện thoại': comment.author_phone || '',
      'Mối quan hệ': comment.author_relationship || '',
      'Nội dung': comment.content,
      'Trang tưởng niệm': comment.profile_name,
      'Trạng thái': comment.status,
      'Vị trí': comment.location || '',
      'Ngày tạo': formatDate(comment.created_at),
    }));
    
    console.log("Export data:", csvData);
    // Implement CSV export logic
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
          {comment.author_phone && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {comment.author_phone}
            </div>
          )}
          {comment.author_relationship && (
            <div className="text-xs text-primary font-medium">
              {comment.author_relationship}
            </div>
          )}
        </div>
      ),
      sortable: true,
      searchable: true,
      hideOnMobile: false,
    },
    {
      key: "content",
      header: "Nội dung",
      render: (comment) => (
        <div className="max-w-xs">
          <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
            {comment.content}
          </p>
          {comment.location && (
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span>📍</span>
              {comment.location}
            </div>
          )}
        </div>
      ),
      sortable: false,
      searchable: true,
      hideOnTablet: true,
    },
    {
      key: "profile_name",
      header: "Trang tưởng niệm",
      render: (comment) => (
        <div className="text-sm text-slate-700 dark:text-slate-300">
          {comment.profile_name || "Unknown Profile"}
        </div>
      ),
      sortable: true,
      searchable: true,
      hideOnMobile: true,
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
      hideOnMobile: true,
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
              <DropdownMenuItem className="cursor-pointer">
                <Users className="h-4 w-4 mr-2" />
                Thông tin liên hệ
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
    {
      key: "author_relationship",
      label: "Mối quan hệ",
      options: [
        { value: "Gia đình", label: "Gia đình" },
        { value: "Bạn bè", label: "Bạn bè" },
        { value: "Học sinh", label: "Học sinh" },
        { value: "Khác", label: "Khác" },
      ],
    },
  ];

  // Mobile card render
  const mobileCardRender = (comment: Comment, index: number) => (
    <Card className="shadow-sm border border-slate-200 dark:border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {comment.author_name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {comment.author_email}
            </p>
            {comment.author_relationship && (
              <span className="inline-block text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-full mt-1">
                {comment.author_relationship}
              </span>
            )}
          </div>
          <div className="flex-shrink-0">
            {getStatusBadge(comment.status)}
          </div>
        </div>
        
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 line-clamp-3">
          {comment.content}
        </p>
        
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {comment.profile_name || "Unknown Profile"}
            </span>
            <span className="text-xs text-slate-400">
              {formatDate(comment.created_at)}
            </span>
            {comment.location && (
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                📍 {comment.location}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {comment.status === "pending" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                  onClick={() => handleApprove(comment.id)}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleReject(comment.id)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="h-4 w-4 mr-2" />
                  Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="h-4 w-4 mr-2" />
                  Thông tin liên hệ
                </DropdownMenuItem>
                {comment.status === "pending" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleApprove(comment.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Duyệt
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleReject(comment.id)}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Từ chối
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => handleDelete(comment.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>Lỗi khi tải dữ liệu bình luận. Vui lòng thử lại.</p>
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData} className="shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Xuất dữ liệu
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">Tổng số</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-300">{stats?.total || 0}</p>
              </div>
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-400">Chờ duyệt</p>
                <p className="text-lg sm:text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {stats?.pending || 0}
                </p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">Đã duyệt</p>
                <p className="text-lg sm:text-2xl font-bold text-green-700 dark:text-green-300">
                  {stats?.approved || 0}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400">Từ chối</p>
                <p className="text-lg sm:text-2xl font-bold text-red-700 dark:text-red-300">
                  {stats?.rejected || 0}
                </p>
              </div>
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-lg border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Mối quan hệ</h3>
            </div>
            <div className="space-y-2">
              {['Gia đình', 'Bạn bè', 'Học sinh', 'Khác'].map(relationship => {
                const count = stats?.relationships?.[relationship] || 0;
                const percentage = stats?.total ? (count / stats.total * 100).toFixed(1) : 0;
                return (
                  <div key={relationship} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{relationship}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-8">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Vị trí</h3>
            </div>
            <div className="space-y-2">
              {['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Khác'].map(location => {
                const count = stats?.locations?.[location] || 0;
                return (
                  <div key={location} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{location}</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Hoạt động gần đây</h3>
            </div>
            <div className="space-y-3">
              {commentsWithProfiles.slice(0, 3).map(comment => (
                <div key={comment.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {comment.author_name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {comment.content}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        data={commentsWithProfiles}
        columns={columns}
        searchPlaceholder="Tìm kiếm theo tên, email hoặc nội dung..."
        filters={filters}
        defaultPageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        emptyState={emptyState}
        loading={isLoading}
        mobileCardRender={mobileCardRender}
        showViewToggle={true}
      />
    </div>
  );
};