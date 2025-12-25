import { useState, useCallback, useMemo } from "react";
import { Plus, Play, Edit, Trash2, Save, ExternalLink, Clock, Users, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { usePlaylists, useCreatePlaylist, useUpdatePlaylist, useDeletePlaylist, CreatePlaylistData } from "@/hooks/usePlaylists";
import { useAllProfiles } from "@/hooks/useProfiles";
import { format } from "date-fns";

interface PlaylistManagerProps {
  selectedProfiles: Set<string>;
  slideSeconds: number;
  onPlayPlaylist: (playlistId: string) => void;
}

interface ProfileSelectionProps {
  dialogType: 'create' | 'edit';
  searchTerm: string;
  onSearchChange: (term: string) => void;
  profiles: any[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  totalProfiles: number;
}

// Optimized ProfileSelection component
const ProfileSelection = ({ 
  dialogType, 
  searchTerm, 
  onSearchChange, 
  profiles, 
  selectedIds, 
  onSelectionChange,
  totalProfiles 
}: ProfileSelectionProps) => {
  const handleSelectAll = useCallback(() => {
    onSelectionChange(profiles.map(p => p.id));
  }, [profiles, onSelectionChange]);

  const handleDeselectAll = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  const handleToggleProfile = useCallback((profileId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, profileId]);
    } else {
      onSelectionChange(selectedIds.filter(id => id !== profileId));
    }
  }, [selectedIds, onSelectionChange]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>Hồ sơ được chọn</Label>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
            Chọn tất cả
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleDeselectAll}>
            Bỏ chọn
          </Button>
        </div>
      </div>
      
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm hồ sơ..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
        <div className="space-y-2">
          {profiles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {searchTerm ? "Không tìm thấy hồ sơ nào" : "Không có hồ sơ nào"}
            </p>
          ) : (
            profiles.map((profile) => (
              <div key={profile.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`${dialogType}-profile-${profile.id}`}
                  checked={selectedIds.includes(profile.id)}
                  onChange={(e) => handleToggleProfile(profile.id, e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label
                  htmlFor={`${dialogType}-profile-${profile.id}`}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {profile.name}
                </label>
              </div>
            ))
          )}
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mt-2">
        Đã chọn: {selectedIds.length} hồ sơ
        {searchTerm && ` (hiển thị ${profiles.length}/${totalProfiles})`}
      </p>
    </div>
  );
};

export const PlaylistManager = ({ selectedProfiles, slideSeconds, onPlayPlaylist }: PlaylistManagerProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<CreatePlaylistData>({
    name: "",
    description: "",
    slide_duration: slideSeconds,
    profile_ids: Array.from(selectedProfiles),
    auto_play: true,
    loop: true,
  });

  const { data: playlists, isLoading } = usePlaylists();
  const { data: profiles } = useAllProfiles();
  const createPlaylist = useCreatePlaylist();
  const updatePlaylist = useUpdatePlaylist();
  const deletePlaylist = useDeletePlaylist();

  // Memoized computations
  const publishedProfiles = useMemo(() => 
    profiles?.filter(p => p.is_published) || [], 
    [profiles]
  );

  const filteredProfiles = useMemo(() => 
    publishedProfiles.filter(profile =>
      profile.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), 
    [publishedProfiles, searchTerm]
  );

  // Optimized handlers
  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      description: "",
      slide_duration: slideSeconds,
      profile_ids: Array.from(selectedProfiles),
      auto_play: true,
      loop: true,
    });
    setEditingPlaylist(null);
    setSearchTerm("");
  }, [selectedProfiles, slideSeconds]);

  const handleCreatePlaylist = useCallback(async () => {
    if (!formData.name.trim()) return;
    await createPlaylist.mutateAsync(formData);
    setIsCreateDialogOpen(false);
    resetForm();
  }, [formData, createPlaylist, resetForm]);

  const handleUpdatePlaylist = useCallback(async () => {
    if (!editingPlaylist || !formData.name.trim()) return;
    await updatePlaylist.mutateAsync({ id: editingPlaylist, ...formData });
    setEditingPlaylist(null);
    resetForm();
  }, [editingPlaylist, formData, updatePlaylist, resetForm]);

  const handleEditPlaylist = useCallback((playlist: any) => {
    setFormData({
      name: playlist.name,
      description: playlist.description || "",
      slide_duration: playlist.slide_duration,
      profile_ids: playlist.profile_ids,
      auto_play: playlist.auto_play,
      loop: playlist.loop,
    });
    setEditingPlaylist(playlist.id);
    setSearchTerm("");
  }, []);

  const handleOpenCreateDialog = useCallback(() => {
    setFormData({
      name: "",
      description: "",
      slide_duration: slideSeconds,
      profile_ids: Array.from(selectedProfiles),
      auto_play: true,
      loop: true,
    });
    setSearchTerm("");
  }, [selectedProfiles, slideSeconds]);

  const handleProfileSelectionChange = useCallback((profile_ids: string[]) => {
    setFormData(prev => ({ ...prev, profile_ids }));
  }, []);

  const getPlaylistUrl = useCallback((playlistId: string, mode: 'standee' | 'profile') => {
    const baseUrl = mode === 'standee' ? '/slideshow' : '/slideshow-profile';
    return `${baseUrl}?playlist=${playlistId}`;
  }, []);

  const isFormValid = formData.name.trim() && formData.profile_ids.length > 0;

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Đang tải playlists...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <List className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Playlists đã lưu</h3>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreateDialog} className="shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Tạo Playlist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo Playlist Mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Tên Playlist *</Label>
                <Input
                  id="name"
                  placeholder="VD: Playlist Tháng 12"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả ngắn về playlist..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Thời gian slide (giây)</Label>
                  <Input
                    type="number"
                    min={5}
                    max={60}
                    value={formData.slide_duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, slide_duration: Number(e.target.value) }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Tự động phát</Label>
                    <Switch
                      checked={formData.auto_play}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_play: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Lặp lại</Label>
                    <Switch
                      checked={formData.loop}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, loop: checked }))}
                    />
                  </div>
                </div>
              </div>

              <ProfileSelection 
                dialogType="create"
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                profiles={filteredProfiles}
                selectedIds={formData.profile_ids}
                onSelectionChange={handleProfileSelectionChange}
                totalProfiles={publishedProfiles.length}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleCreatePlaylist}
                  disabled={!isFormValid || createPlaylist.isPending}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Lưu Playlist
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Playlists List */}
      {!playlists || playlists.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <List className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Chưa có playlist nào</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tạo playlist để lưu cấu hình trình chiếu và sử dụng lại dễ dàng
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {playlists.map((playlist) => (
            <Card key={playlist.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{playlist.name}</CardTitle>
                    {playlist.description && (
                      <p className="text-sm text-muted-foreground mt-1">{playlist.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditPlaylist(playlist)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xóa Playlist</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc muốn xóa playlist "{playlist.name}"? Hành động này không thể hoàn tác.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deletePlaylist.mutate(playlist.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Xóa
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {playlist.slide_duration}s
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {playlist.profile_ids.length} hồ sơ
                  </Badge>
                  {playlist.auto_play && (
                    <Badge variant="outline" className="text-xs">Tự động</Badge>
                  )}
                  {playlist.loop && (
                    <Badge variant="outline" className="text-xs">Lặp lại</Badge>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground mb-3">
                  Tạo: {format(new Date(playlist.created_at), "dd/MM/yyyy HH:mm")}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(getPlaylistUrl(playlist.id, 'standee'), '_blank')}
                    className="flex-1"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Standee
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => window.open(getPlaylistUrl(playlist.id, 'profile'), '_blank')}
                    className="flex-1"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingPlaylist && (
        <Dialog open={!!editingPlaylist} onOpenChange={() => setEditingPlaylist(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Tên Playlist *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Mô tả</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Thời gian slide (giây)</Label>
                  <Input
                    type="number"
                    min={5}
                    max={60}
                    value={formData.slide_duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, slide_duration: Number(e.target.value) }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Tự động phát</Label>
                    <Switch
                      checked={formData.auto_play}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_play: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Lặp lại</Label>
                    <Switch
                      checked={formData.loop}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, loop: checked }))}
                    />
                  </div>
                </div>
              </div>

              <ProfileSelection 
                dialogType="edit"
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                profiles={filteredProfiles}
                selectedIds={formData.profile_ids}
                onSelectionChange={handleProfileSelectionChange}
                totalProfiles={publishedProfiles.length}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingPlaylist(null)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleUpdatePlaylist}
                  disabled={!isFormValid || updatePlaylist.isPending}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Cập nhật
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};