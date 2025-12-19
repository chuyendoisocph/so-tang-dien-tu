import { Plus, Eye, Edit, Trash2, MoreHorizontal, ExternalLink, Loader2 } from "lucide-react";
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
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Trang Tưởng Niệm</h1>
          <p className="text-muted-foreground">Hệ thống Sổ tang điện tử.</p>
        </div>
        <Button onClick={onCreateNew} className="w-full sm:w-auto shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Tạo mới
        </Button>
      </div>

      {/* Table Card */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-muted-foreground uppercase text-xs">#</TableHead>
                  <TableHead className="font-semibold text-muted-foreground uppercase text-xs">Mã Hồ Sơ</TableHead>
                  <TableHead className="font-semibold text-muted-foreground uppercase text-xs">Người mất</TableHead>
                  <TableHead className="font-semibold text-muted-foreground uppercase text-xs">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-muted-foreground uppercase text-xs">Ngày tạo</TableHead>
                  <TableHead className="font-semibold text-muted-foreground uppercase text-xs text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles?.map((profile, index) => (
                  <TableRow key={profile.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded font-mono text-sm">
                        {profile.slug || profile.id.slice(0, 8)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {profile.avatar_url && (
                          <img
                            src={profile.avatar_url}
                            alt={profile.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <span className="font-semibold">{profile.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {profile.is_published ? (
                        <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                          Đã xuất bản
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Nháp
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(profile.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/profile/${profile.slug || profile.id}`)}
                          aria-label={`Xem trang ${profile.name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/profile/${profile.slug || profile.id}?kiosk=1`)}
                          aria-label={`Xem kiosk ${profile.name}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
                              Sửa
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="cursor-pointer text-destructive"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Xóa
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bạn có chắc muốn xóa hồ sơ "{profile.name}"? Hành động này không thể hoàn tác.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(profile.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Xóa
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
            <div className="text-center py-12 text-muted-foreground">
              <p>Chưa có hồ sơ nào. Nhấn "Tạo mới" để bắt đầu.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
