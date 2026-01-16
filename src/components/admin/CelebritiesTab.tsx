import { Plus, Eye, Edit, Trash2, MoreHorizontal, Loader2, Star, Search, Filter, ChevronLeft, ChevronRight, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useCelebrityProfiles, useDeleteProfile } from "@/hooks/useProfiles";
import { format } from "date-fns";

interface CelebritiesTabProps {
  onCreateNew: () => void;
  onEdit: (profile: { id: string; jobId: string; name: string }) => void;
}

export const CelebritiesTab = ({ onCreateNew, onEdit }: CelebritiesTabProps) => {
  const navigate = useNavigate();
  const { data: profiles, isLoading, error } = useCelebrityProfiles();
  const deleteProfile = useDeleteProfile();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredProfiles = useMemo(() => {
    if (!profiles) return [];
    return profiles.filter(profile => {
      const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (profile.slug || profile.id).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "published" && profile.is_published) ||
        (statusFilter === "draft" && !profile.is_published);
      return matchesSearch && matchesStatus;
    });
  }, [profiles, searchTerm, statusFilter]);

  const paginatedProfiles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProfiles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProfiles, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

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
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
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
          <h1 className="text-2xl font-bold text-foreground bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent flex items-center gap-2">
            <Star className="h-6 w-6 text-amber-500" />
            Người Nổi Tiếng
          </h1>
          <p className="text-muted-foreground text-sm">Quản lý hồ sơ nhân vật nổi tiếng, lịch sử</p>
        </div>
        <Button onClick={onCreateNew} className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
          <Plus className="h-4 w-4 mr-2" />
          Thêm Người Nổi Tiếng
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Tổng Hồ Sơ</p>
                <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{profiles?.length || 0}</p>
              </div>
              <Star className="h-6 w-6 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600 dark:text-green-400">Đã Xuất Bản</p>
                <p className="text-xl font-bold text-green-700 dark:text-green-300">
                  {profiles?.filter(p => p.is_published).length || 0}
                </p>
              </div>
              <Eye className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Bản Nháp</p>
                <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                  {profiles?.filter(p => !p.is_published).length || 0}
                </p>
              </div>
              <Edit className="h-6 w-6 text-slate-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-sm border-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc mã hồ sơ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={(value: "all" | "published" | "draft") => setStatusFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="published">Đã xuất bản</SelectItem>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hiển thị:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Hiển thị {paginatedProfiles.length} trong tổng số {filteredProfiles.length} hồ sơ
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-b-2">
                  <TableHead className="font-bold text-amber-700 dark:text-amber-300 uppercase text-xs tracking-wide">#</TableHead>
                  <TableHead className="font-bold text-amber-700 dark:text-amber-300 uppercase text-xs tracking-wide">Mã Hồ Sơ</TableHead>
                  <TableHead className="font-bold text-amber-700 dark:text-amber-300 uppercase text-xs tracking-wide">Nhân vật</TableHead>
                  <TableHead className="font-bold text-amber-700 dark:text-amber-300 uppercase text-xs tracking-wide">Trạng thái</TableHead>
                  <TableHead className="font-bold text-amber-700 dark:text-amber-300 uppercase text-xs tracking-wide">Ngày tạo</TableHead>
                  <TableHead className="font-bold text-amber-700 dark:text-amber-300 uppercase text-xs tracking-wide text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProfiles.map((profile, index) => (
                  <TableRow key={profile.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition-colors border-b border-slate-100 dark:border-slate-800">
                    <TableCell className="font-medium text-slate-600 dark:text-slate-400">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell>
                      <span className="px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-600 rounded-full font-mono text-sm font-medium border border-amber-500/20">
                        {profile.slug || profile.id.slice(0, 8)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt={profile.name} className="w-10 h-10 rounded-full object-cover border-2 border-amber-200 shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-semibold border-2 border-amber-200 shadow-sm">
                            {profile.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{profile.name}</span>
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          </div>
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
                          className="h-8 w-8 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950 cursor-pointer"
                          onClick={() => navigate(`/profile/${profile.slug || profile.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="cursor-pointer" onSelect={() => navigate(`/profile/${profile.slug || profile.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Xem trang
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer" onSelect={() => onEdit({ id: profile.id, jobId: profile.slug || profile.id, name: profile.name })}>
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Xóa hồ sơ
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Xác nhận xóa hồ sơ</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bạn có chắc muốn xóa hồ sơ "<strong>{profile.name}</strong>"?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(profile.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
                {paginatedProfiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <Star className="h-12 w-12 mx-auto mb-4 text-amber-300" />
                      <p>Chưa có hồ sơ người nổi tiếng nào</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
            {paginatedProfiles.map((profile) => (
              <div key={profile.id} className="p-4 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.name} className="w-14 h-14 rounded-xl object-cover border-2 border-amber-200 shadow-md" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold text-lg border-2 border-amber-200 shadow-md">
                        {profile.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base truncate">{profile.name}</h3>
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
                        </div>
                        {profile.birth_date && profile.death_date && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {new Date(profile.birth_date).getFullYear()} - {new Date(profile.death_date).getFullYear()}
                          </p>
                        )}
                      </div>
                      {profile.is_published ? (
                        <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm text-xs shrink-0">Xuất bản</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-200 text-slate-700 border-0 text-xs shrink-0">Nháp</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-3">
                      <Button variant="outline" size="sm" className="flex-1 h-8 text-xs cursor-pointer" onClick={() => navigate(`/profile/${profile.slug || profile.id}`)}>
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        Xem
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 h-8 text-xs cursor-pointer" onClick={() => onEdit({ id: profile.id, jobId: profile.slug || profile.id, name: profile.name })}>
                        <Edit className="h-3.5 w-3.5 mr-1.5" />
                        Sửa
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {paginatedProfiles.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-4 text-amber-300" />
                <p>Chưa có hồ sơ người nổi tiếng nào</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="cursor-pointer">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {currentPage} / {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="cursor-pointer">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
