import { Plus, Eye, Edit, Trash2, MoreHorizontal, Loader2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { useAllProfiles, useDeleteProfile } from "@/hooks/useProfiles";
import { format } from "date-fns";

interface ProfilesTabProps {
  onCreateNew: () => void;
  onEdit: (profile: { id: string; jobId: string; name: string }) => void;
}

interface Profile {
  id: string;
  name: string;
  slug?: string;
  avatar_url?: string;
  birth_date?: string;
  death_date?: string;
  is_published: boolean;
  created_at: string;
}

export const ProfilesTabWithDataTable = ({ onCreateNew, onEdit }: ProfilesTabProps) => {
  const navigate = useNavigate();
  const { data: profiles, isLoading, error } = useAllProfiles();
  const deleteProfile = useDeleteProfile();

  const handleDelete = async (id: string) => {
    await deleteProfile.mutateAsync(id);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return dateString;
    }
  };

  // Define table columns
  const columns: Column<Profile>[] = [
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
      hideOnMobile: true,
      className: "w-12",
    },
    {
      key: "slug",
      header: "Mã Hồ Sơ",
      render: (profile) => (
        <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 text-primary rounded-full font-mono text-xs sm:text-sm font-medium border border-primary/20">
          {profile.slug || profile.id.slice(0, 8)}
        </span>
      ),
      sortable: true,
      searchable: true,
      hideOnTablet: true,
    },
    {
      key: "name",
      header: "Người mất",
      render: (profile) => (
        <div className="flex items-center gap-2 sm:gap-3">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-semibold border-2 border-white shadow-sm text-xs sm:text-sm">
              {profile.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base block truncate">
              {profile.name}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {profile.birth_date && profile.death_date && 
                `${new Date(profile.birth_date).getFullYear()} - ${new Date(profile.death_date).getFullYear()}`
              }
            </p>
          </div>
        </div>
      ),
      sortable: true,
      searchable: true,
    },
    {
      key: "is_published",
      header: "Trạng thái",
      render: (profile) => (
        profile.is_published ? (
          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm text-xs">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mr-1 sm:mr-2"></div>
            <span className="hidden sm:inline">Đã xuất bản</span>
            <span className="sm:hidden">Xuất bản</span>
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border border-slate-300 text-xs">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-400 rounded-full mr-1 sm:mr-2"></div>
            <span className="hidden sm:inline">Bản nháp</span>
            <span className="sm:hidden">Nháp</span>
          </Badge>
        )
      ),
      sortable: true,
      searchable: false,
    },
    {
      key: "created_at",
      header: "Ngày tạo",
      render: (profile) => (
        <span className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
          {formatDate(profile.created_at)}
        </span>
      ),
      sortable: true,
      searchable: false,
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (profile) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
            onClick={() => navigate(`/profile/${profile.slug || profile.id}`)}
            aria-label={`Xem trang ${profile.name}`}
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-slate-50 dark:hover:bg-slate-800">
                <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => navigate(`/profile/${profile.slug || profile.id}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Xem trang
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => onEdit({ id: profile.id, jobId: profile.slug || profile.id, name: profile.name })}
              >
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa hồ sơ
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa hồ sơ</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc muốn xóa hồ sơ "<strong>{profile.name}</strong>"? 
                      Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(profile.id)}
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
      className: "w-24 sm:w-32",
    },
  ];

  // Define filters
  const filters: FilterOption[] = [
    {
      key: "is_published",
      label: "Trạng thái",
      options: [
        { value: "true", label: "Đã xuất bản" },
        { value: "false", label: "Bản nháp" },
      ],
    },
  ];

  // Mobile card render
  const mobileCardRender = (profile: Profile, index: number) => (
    <Card className="shadow-sm border border-slate-200 dark:border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-semibold border-2 border-white shadow-sm flex-shrink-0">
              {profile.name.charAt(0)}
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {profile.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {profile.birth_date && profile.death_date && 
                    `${new Date(profile.birth_date).getFullYear()} - ${new Date(profile.death_date).getFullYear()}`
                  }
                </p>
              </div>
              
              {/* Status */}
              <div className="flex-shrink-0">
                {profile.is_published ? (
                  <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm text-xs">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mr-1"></div>
                    Xuất bản
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border border-slate-300 text-xs">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-1"></div>
                    Nháp
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Meta info */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Mã: {profile.slug || profile.id.slice(0, 8)}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(profile.created_at)}
                </span>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
                  onClick={() => navigate(`/profile/${profile.slug || profile.id}`)}
                  aria-label={`Xem trang ${profile.name}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={() => navigate(`/profile/${profile.slug || profile.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Xem trang
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={() => onEdit({ id: profile.id, jobId: profile.slug || profile.id, name: profile.name })}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive focus:text-destructive"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa hồ sơ
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xác nhận xóa hồ sơ</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc muốn xóa hồ sơ "<strong>{profile.name}</strong>"? 
                            Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(profile.id)}
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
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Empty state component
  const emptyState = (
    <div>
      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
        <Users className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Chưa có hồ sơ nào</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Bắt đầu tạo hồ sơ tưởng niệm đầu tiên của bạn</p>
      <Button onClick={onCreateNew} className="shadow-lg" size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Tạo Hồ Sơ Đầu Tiên
      </Button>
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
        <p>Lỗi khi tải dữ liệu. Vui lòng thử lại.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Quản lý Trang Tưởng Niệm
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Hệ thống Sổ tang điện tử chuyên nghiệp</p>
        </div>
        <Button onClick={onCreateNew} className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Tạo Hồ Sơ Mới</span>
          <span className="sm:hidden">Tạo Mới</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">Tổng Hồ Sơ</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700 dark:text-blue-300">{profiles?.length || 0}</p>
              </div>
              <Users className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">Đã Xuất Bản</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700 dark:text-green-300">
                  {profiles?.filter(p => p.is_published).length || 0}
                </p>
              </div>
              <Eye className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800 col-span-2 lg:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-400">Bản Nháp</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {profiles?.filter(p => !p.is_published).length || 0}
                </p>
              </div>
              <Edit className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        data={profiles || []}
        columns={columns}
        searchPlaceholder="Tìm kiếm theo tên hoặc mã hồ sơ..."
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