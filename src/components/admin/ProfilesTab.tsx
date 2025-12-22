import { Plus, Eye, Edit, Trash2, MoreHorizontal, ExternalLink, Loader2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { useAllProfiles, useDeleteProfile } from "@/hooks/useProfiles";
import { format } from "date-fns";

interface ProfilesTabProps {
  onCreateNew: () => void;
  onEdit: (profile: { id: string; jobId: string; name: string }) => void;
}

export const ProfilesTab = ({ onCreateNew, onEdit }: ProfilesTabProps) => {
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
          <h1 className="text-2xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Quản lý Trang Tưởng Niệm
          </h1>
          <p className="text-muted-foreground text-sm">Hệ thống Sổ tang điện tử chuyên nghiệp</p>
        </div>
        <Button onClick={onCreateNew} className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Tạo Hồ Sơ Mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Tổng Hồ Sơ</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{profiles?.length || 0}</p>
              </div>
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Đã Xuất Bản</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {profiles?.filter(p => p.is_published).length || 0}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Bản Nháp</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {profiles?.filter(p => !p.is_published).length || 0}
                </p>
              </div>
              <Edit className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b-2">
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wide">#</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wide">Mã Hồ Sơ</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wide">Người mất</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wide">Trạng thái</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wide">Ngày tạo</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wide text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles?.map((profile, index) => (
                  <TableRow key={profile.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800">
                    <TableCell className="font-medium text-slate-600 dark:text-slate-400">{index + 1}</TableCell>
                    <TableCell>
                      <span className="px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 text-primary rounded-full font-mono text-sm font-medium border border-primary/20">
                        {profile.slug || profile.id.slice(0, 8)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-semibold border-2 border-white shadow-sm">
                            {profile.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{profile.name}</span>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {profile.birth_date && profile.death_date && 
                              `${new Date(profile.birth_date).getFullYear()} - ${new Date(profile.death_date).getFullYear()}`
                            }
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {profile.is_published ? (
                        <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm">
                          <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                          Đã xuất bản
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border border-slate-300">
                          <div className="w-2 h-2 bg-slate-400 rounded-full mr-2"></div>
                          Bản nháp
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {formatDate(profile.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
                          onClick={() => navigate(`/profile/${profile.slug || profile.id}`)}
                          aria-label={`Xem trang ${profile.name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950"
                          onClick={() => navigate(`/profile/${profile.slug || profile.id}?kiosk=1`)}
                          aria-label={`Xem kiosk ${profile.name}`}
                        >
                          <ExternalLink className="h-4 w-4" />
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
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onSelect={() => navigate(`/profile/${profile.slug || profile.id}?kiosk=1`)}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Xem chế độ Kiosk
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {(!profiles || profiles.length === 0) && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Chưa có hồ sơ nào</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">Bắt đầu tạo hồ sơ tưởng niệm đầu tiên của bạn</p>
              <Button onClick={onCreateNew} className="shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Tạo Hồ Sơ Đầu Tiên
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
