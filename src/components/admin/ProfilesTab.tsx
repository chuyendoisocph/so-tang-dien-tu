import { Plus, Eye, Edit, Trash2, MoreHorizontal, Loader2, Users, Search, Filter, ChevronLeft, ChevronRight, Image } from "lucide-react";
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
import { useAllProfiles, useDeleteProfile } from "@/hooks/useProfiles";
import { useProfileComments } from "@/hooks/useComments";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toPng } from "html-to-image";
import { useRef } from "react";
import MemorialProfileWeb from "@/components/profile/MemorialProfileWeb";
import { StandeeExport1080x1920 } from "@/components/admin/StandeeExport";
import { toast } from "sonner";

interface ProfilesTabProps {
  onCreateNew: () => void;
  onEdit: (profile: { id: string; jobId: string; name: string }) => void;
}

export const ProfilesTab = ({ onCreateNew, onEdit }: ProfilesTabProps) => {
  const navigate = useNavigate();
  const { data: profiles, isLoading, error } = useAllProfiles();
  const deleteProfile = useDeleteProfile();

  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtered and paginated data
  const filteredProfiles = useMemo(() => {
    if (!profiles) return [];

    return profiles.filter(profile => {
      // Search filter
      const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (profile.slug || profile.id).toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
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

  // Reset to first page when filters change
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

  // Standee Generation Logic
  const standeeRef = useRef<HTMLDivElement>(null);
  const standee1080Ref = useRef<HTMLDivElement>(null);
  const [standeeProfile, setStandeeProfile] = useState<any>(null);
  const [standee1080Profile, setStandee1080Profile] = useState<any>(null);
  const [standeeTributes, setStandeeTributes] = useState<any[]>([]);
  const [standee1080Tributes, setStandee1080Tributes] = useState<any[]>([]);
  
  // Queue system for multiple downloads
  const downloadQueueRef = useRef<any[]>([]);
  const isProcessingRef = useRef(false);

  const handleDownloadStandee = (profile: any) => {
    // Add to queue
    downloadQueueRef.current.push({ profile, type: 'A4' });
    toast.info(`Đã thêm ${profile.name} vào hàng đợi tải ảnh (${downloadQueueRef.current.length} ảnh)`);
    
    // Start processing if not already
    processDownloadQueue();
  };

  // Process the download queue sequentially
  const processDownloadQueue = async () => {
    if (isProcessingRef.current || downloadQueueRef.current.length === 0) {
      return;
    }
    
    isProcessingRef.current = true;
    const { profile, type } = downloadQueueRef.current.shift()!;
    
    if (type === '1080x1920') {
      await processStandee1080Download(profile);
    } else if (type === 'A4') {
      await processStandeeA4Download(profile);
    }
    
    isProcessingRef.current = false;
    
    // Process next item in queue
    if (downloadQueueRef.current.length > 0) {
      processDownloadQueue();
    }
  };

  const processStandee1080Download = async (profile: any) => {
    // Fetch tributes for this profile
    let tributes: any[] = [];
    try {
      const { data: comments } = await supabase
        .from('comments')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(4);
      
      tributes = (comments || []).map((c: any) => ({
        id: c.id,
        name: c.author_name,
        phone: c.author_email || '',
        message: c.content,
        date: format(new Date(c.created_at), 'dd/MM/yyyy')
      }));
    } catch (error) {
      console.error('Error fetching tributes:', error);
    }
    
    setStandee1080Profile(profile);
    setStandee1080Tributes(tributes);

    // Wait for component to render and ref to be available
    let attempts = 0;
    const maxAttempts = 30; // 30 * 100ms = 3 seconds max wait
    
    while (!standee1080Ref.current && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    // Additional wait for images to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (standee1080Ref.current) {
      try {
        toast.info(`Đang tạo ảnh ${profile.name} (1080x1920)...`);

        const dataUrl = await toPng(standee1080Ref.current, {
          quality: 1.0,
          pixelRatio: 1,
          backgroundColor: '#FDFCF8',
          width: 1080,
          height: 1920,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left',
          }
        });

        const link = document.createElement("a");
        link.download = `${profile.name}-standee-1080x1920.png`;
        link.href = dataUrl;
        link.click();

        toast.success(`Đã tải xuống ${profile.name}!`);
      } catch (err) {
        console.error("Error generating standee 1080x1920:", err);
        toast.error(`Lỗi khi tạo ảnh ${profile.name}`);
      }
    } else {
      toast.error(`Không thể tạo ảnh ${profile.name} - component không render`);
    }
    
    // Clear profile after capture
    setStandee1080Profile(null);
    setStandee1080Tributes([]);
  };

  const processStandeeA4Download = async (profile: any) => {
    // Fetch tributes for this profile
    let tributes: any[] = [];
    try {
      const { data: comments } = await supabase
        .from('comments')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(4);
      
      tributes = (comments || []).map((c: any) => ({
        id: c.id,
        name: c.author_name,
        phone: c.author_email || '',
        message: c.content,
        date: format(new Date(c.created_at), 'dd/MM/yyyy')
      }));
    } catch (error) {
      console.error('Error fetching tributes:', error);
    }
    
    setStandeeProfile(profile);
    setStandeeTributes(tributes);

    // Wait for component to render and ref to be available
    let attempts = 0;
    const maxAttempts = 20; // 20 * 100ms = 2 seconds max wait
    
    while (!standeeRef.current && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    // Additional wait for images to load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (standeeRef.current) {
      try {
        toast.info(`Đang tạo ảnh ${profile.name} (A4)...`);

        const dataUrl = await toPng(standeeRef.current, {
          quality: 1.0,
          pixelRatio: 3,
          backgroundColor: '#FEF9E7',
        });

        const link = document.createElement("a");
        link.download = `${profile.name}-standee-A4.png`;
        link.href = dataUrl;
        link.click();

        toast.success(`Đã tải xuống ${profile.name}!`);
      } catch (err) {
        console.error("Error generating standee A4:", err);
        toast.error(`Lỗi khi tạo ảnh ${profile.name}`);
      }
    } else {
      toast.error(`Không thể tạo ảnh ${profile.name} - component không render`);
    }
    
    // Clear profile after capture
    setStandeeProfile(null);
    setStandeeTributes([]);
  };

  const handleDownloadStandee1080x1920 = (profile: any) => {
    // Add to queue
    downloadQueueRef.current.push({ profile, type: '1080x1920' });
    toast.info(`Đã thêm ${profile.name} vào hàng đợi tải ảnh (${downloadQueueRef.current.length} ảnh)`);
    
    // Start processing if not already
    processDownloadQueue();
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

      {/* Search and Filter Controls */}
      <Card className="shadow-sm border-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc mã hồ sơ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
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

            {/* Items per page */}
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
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results info */}
          <div className="mt-4 text-sm text-muted-foreground">
            Hiển thị {paginatedProfiles.length} trong tổng số {filteredProfiles.length} hồ sơ
            {searchTerm && ` (tìm kiếm: "${searchTerm}")`}
            {statusFilter !== "all" && ` (lọc: ${statusFilter === "published" ? "Đã xuất bản" : "Bản nháp"})`}
          </div>
        </CardContent>
      </Card>

      {/* Table Card - Desktop & Mobile Responsive */}
      <Card className="shadow-lg border-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardContent className="p-0">
          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden md:block overflow-x-auto">
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
                {paginatedProfiles.map((profile, index) => (
                  <TableRow key={profile.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800">
                    <TableCell className="font-medium text-slate-600 dark:text-slate-400">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
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
                              onSelect={() => handleDownloadStandee(profile)}
                            >
                              <Image className="h-4 w-4 mr-2" />
                              Tải ảnh in (A4)
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onSelect={() => handleDownloadStandee1080x1920(profile)}
                            >
                              <Image className="h-4 w-4 mr-2" />
                              Tải ảnh (1080x1920)
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

          {/* Mobile Card View - Visible only on mobile */}
          <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
            {paginatedProfiles.map((profile, index) => (
              <div key={profile.id} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.name}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-lg border-2 border-white shadow-md">
                        {profile.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base truncate">
                          {profile.name}
                        </h3>
                        {profile.birth_date && profile.death_date && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {new Date(profile.birth_date).getFullYear()} - {new Date(profile.death_date).getFullYear()}
                          </p>
                        )}
                      </div>
                      
                      {/* Status Badge */}
                      {profile.is_published ? (
                        <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm text-xs shrink-0">
                          Xuất bản
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-200 text-slate-700 border-0 text-xs shrink-0">
                          Nháp
                        </Badge>
                      )}
                    </div>

                    {/* Profile Code */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-slate-500">Mã:</span>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded font-mono text-xs font-medium">
                        {profile.slug || profile.id.slice(0, 8)}
                      </span>
                    </div>

                    {/* Created Date */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      Tạo: {formatDate(profile.created_at)}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => navigate(`/profile/${profile.slug || profile.id}`)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        Xem
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => onEdit({ id: profile.id, jobId: profile.slug || profile.id, name: profile.name })}
                      >
                        <Edit className="h-3.5 w-3.5 mr-1.5" />
                        Sửa
                      </Button>
                      
                      {/* More Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 px-2">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={() => handleDownloadStandee(profile)}
                          >
                            <Image className="h-4 w-4 mr-2" />
                            Tải ảnh in (A4)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={() => handleDownloadStandee1080x1920(profile)}
                          >
                            <Image className="h-4 w-4 mr-2" />
                            Tải ảnh (1080x1920)
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
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
            ))}
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

          {filteredProfiles.length === 0 && profiles && profiles.length > 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Không tìm thấy kết quả</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredProfiles.length > 0 && totalPages > 1 && (
        <Card className="shadow-sm border-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Page info */}
              <div className="text-sm text-muted-foreground">
                Trang {currentPage} / {totalPages}
                <span className="ml-2">
                  ({((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredProfiles.length)} của {filteredProfiles.length})
                </span>
              </div>

              {/* Pagination controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="hidden sm:flex"
                >
                  Đầu
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Trước</span>
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <span className="hidden sm:inline mr-1">Sau</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="hidden sm:flex"
                >
                  Cuối
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden Container for Standee Generation */}
      {standeeProfile && (
        <div style={{ position: "fixed", top: "-9999px", left: "-9999px", zIndex: -1 }}>
          <div ref={standeeRef}>
            <MemorialProfileWeb
              profile={{
                id: standeeProfile.id,
                name: standeeProfile.name,
                dateRange: `${new Date(standeeProfile.birth_date || '').getFullYear()} - ${new Date(standeeProfile.death_date || '').getFullYear()}`,
                avatarUrl: standeeProfile.avatar_url,
                biography: standeeProfile.biography || '',
                roles: [], // You might need to fetch roles if they aren't in the basic profile object, or pass empty if acceptable
                coverUrl: standeeProfile.cover_url,
                mapsUrl: standeeProfile.maps_url,
                isBuried: standeeProfile.is_buried
              }}
              tributes={standeeTributes}
              photos={[]}
              formData={{ name: '', phone: '', message: '' }}
              onChangeForm={() => { }}
              onSubmitTribute={() => { }}
              onOpenShare={() => { }}
              standeeMode={true}
            />
          </div>
        </div>
      )}

      {/* Hidden Container for Standee 1080x1920 Generation */}
      {standee1080Profile && (
        <div style={{ position: "fixed", top: "-9999px", left: "-9999px", zIndex: -1 }}>
          <StandeeExport1080x1920
            ref={standee1080Ref}
            profile={standee1080Profile}
            tributes={standee1080Tributes}
          />
        </div>
      )}
    </div>
  );
};
