import { MessageSquare, Eye, Trash2, MoreHorizontal, Loader2, Download, BarChart3, TrendingUp, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  useDeleteComment,
  useProfileNames,
  Comment 
} from "@/hooks/useComments";
import * as XLSX from 'xlsx';

export const CommentsTab = () => {
  const { data: comments = [], isLoading, error } = useAllComments();
  const { data: profileNames } = useProfileNames();
  const { data: stats } = useCommentStats();
  const deleteComment = useDeleteComment();

  // Transform comments to include profile names
  const commentsWithProfiles = comments.map((comment: any) => ({
    ...comment,
    profile_name: profileNames?.get(comment.profile_id) || "Unknown Profile"
  }));

  const handleDelete = async (id: string) => {
    try {
      await deleteComment.mutateAsync(id);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleExportData = () => {
    if (!comments || comments.length === 0) {
      alert("Không có dữ liệu để xuất");
      return;
    }

    // Prepare data for Excel export
    const excelData = commentsWithProfiles.map((comment, index) => ({
      'STT': index + 1,
      'Tên người gửi': comment.author_name || '',
      'Email': comment.author_email || '',
      'Nội dung': comment.content || '',
      'Trang tưởng niệm': comment.profile_name || 'Unknown',
      'Ngày tạo': formatDate(comment.created_at)
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 5 },   // STT
      { wch: 25 },  // Tên người gửi
      { wch: 30 },  // Email
      { wch: 50 },  // Nội dung
      { wch: 25 },  // Trang tưởng niệm
      { wch: 20 }   // Ngày tạo
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bình luận');

    // Generate Excel file and download
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    XLSX.writeFile(wb, `binh-luan_${timestamp}.xlsx`);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch {
      return dateString;
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
      key: "profile_name",
      label: "Trang tưởng niệm",
      options: Array.from(new Set(commentsWithProfiles.map(c => c.profile_name).filter(Boolean)))
        .map(name => ({ value: name, label: name })),
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
          </div>
          
          <div className="flex items-center gap-1">
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
          <p className="text-muted-foreground text-sm">Xem và quản lý bình luận từ người dùng</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData} className="shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Xuất dữ liệu
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">Tổng số bình luận</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-300">{stats?.total || 0}</p>
              </div>
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">Hôm nay</p>
                <p className="text-lg sm:text-2xl font-bold text-green-700 dark:text-green-300">
                  {comments.filter(c => {
                    const today = new Date().toDateString();
                    const commentDate = new Date(c.created_at).toDateString();
                    return today === commentDate;
                  }).length}
                </p>
              </div>
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-lg border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Thống kê theo trang</h3>
            </div>
            <div className="space-y-2">
              {Array.from(new Set(commentsWithProfiles.map(c => c.profile_name).filter(Boolean)))
                .slice(0, 5)
                .map(profileName => {
                  const count = commentsWithProfiles.filter(c => c.profile_name === profileName).length;
                  const percentage = stats?.total ? (count / stats.total * 100).toFixed(1) : 0;
                  return (
                    <div key={profileName} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[150px]">{profileName}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
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
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Hoạt động gần đây</h3>
            </div>
            <div className="space-y-3">
              {commentsWithProfiles.slice(0, 4).map(comment => (
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