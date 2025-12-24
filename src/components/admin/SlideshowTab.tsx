import { useState } from "react";
import { toast } from "sonner";
import { Play, Settings, Monitor, Clock, RotateCcw, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAllProfiles } from "@/hooks/useProfiles";
import { PlaylistManager } from "./PlaylistManager";

export const SlideshowTab = () => {
  const [slideSeconds, setSlideSeconds] = useState(15);
  const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set());
  const { data: profiles, isLoading } = useAllProfiles();

  const publishedProfiles = profiles?.filter(p => p.is_published) || [];

  const toggleProfile = (id: string) => {
    const newSelected = new Set(selectedProfiles);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProfiles(newSelected);
  };

  const selectAll = () => {
    if (selectedProfiles.size === publishedProfiles.length) {
      setSelectedProfiles(new Set());
    } else {
      setSelectedProfiles(new Set(publishedProfiles.map(p => p.id)));
    }
  };

  const openProfileMode = () => {
    const profileIds = Array.from(selectedProfiles).join(",");
    const url = `/slideshow-profile?time=${slideSeconds}${profileIds ? `&profiles=${profileIds}` : ""}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Đã mở trình chiếu");
  };

  const openPlaylist = (playlistId: string) => {
    // This will be handled by the playlist URLs
    toast.success("Đã mở playlist");
  };

  const formatDateRange = (birthDate: string | null, deathDate: string | null) => {
    const birth = birthDate ? new Date(birthDate).getFullYear() : "?";
    const death = deathDate ? new Date(deathDate).getFullYear() : "?";
    return `${birth} - ${death}`;
  };

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Cấu hình Trình chiếu
          </h1>
          <p className="text-muted-foreground text-sm">Thiết lập hiển thị cho màn hình trình chiếu</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            className="flex-1 sm:flex-initial shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90"
            onClick={openProfileMode}
            disabled={selectedProfiles.size === 0}
          >
            <Play className="h-4 w-4 mr-2" />
            Bắt đầu trình chiếu
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Settings Card */}
        <Card className="shadow-lg border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm hover-lift">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Settings className="h-4 w-4 text-blue-600" />
              </div>
              Cài đặt chung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <div>
                <Label className="font-semibold text-green-700 dark:text-green-300">Tự động chạy</Label>
                <p className="text-sm text-green-600 dark:text-green-400">Bắt đầu trình chiếu khi tải trang</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950">
              <div>
                <Label className="font-semibold text-purple-700 dark:text-purple-300">Lặp lại</Label>
                <p className="text-sm text-purple-600 dark:text-purple-400">Quay lại đầu khi hết danh sách</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                <Clock className="h-4 w-4 text-amber-500" />
                Thời gian mỗi slide (giây)
              </Label>
              <Input
                type="number"
                value={slideSeconds}
                min={5}
                max={60}
                onChange={(e) => setSlideSeconds(Math.max(5, Math.min(60, Number(e.target.value) || 0)))}
                className="text-center text-lg font-semibold border-slate-300 focus:border-primary focus:ring-primary/20"
              />
              <p className="text-xs text-slate-500">Từ 5 đến 60 giây mỗi slide</p>
            </div>
          </CardContent>
        </Card>

        {/* Slideshow Types Card */}
        <Card className="shadow-lg border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm hover-lift">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Monitor className="h-4 w-4 text-purple-600" />
              </div>
              Chế độ hiển thị
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {/* Profile Mode */}
            <div
              className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all cursor-pointer hover:shadow-md hover:border-green-300 dark:hover:border-green-600"
              role="button"
              tabIndex={0}
              onClick={openProfileMode}
              onKeyDown={(e) => e.key === 'Enter' && openProfileMode()}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-28 bg-gradient-to-b from-memorial-standee-from to-memorial-standee-to rounded-lg flex-shrink-0 flex flex-col items-center p-2 shadow-md">
                  <div className="w-full h-6 bg-foreground/20 rounded-t" />
                  <div className="w-6 h-6 bg-foreground/30 rounded-full -mt-3 border-2 border-card" />
                  <div className="w-10 h-2 bg-foreground/20 rounded mt-1" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Trình chiếu Profile</h4>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Trình chiếu các trang Profile đầy đủ với tiểu sử và lời chia buồn, phù hợp màn hình ngang.
                  </p>
                  <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium">
                    Phù hợp: TV ngang, máy tính, tablet
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Selection */}
        <Card className="shadow-lg border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-lg">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <RotateCcw className="h-4 w-4 text-amber-600" />
                </div>
                Danh sách Hồ sơ trong Trình chiếu
                {selectedProfiles.size > 0 && (
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {selectedProfiles.size} đã chọn
                  </span>
                )}
              </span>
              <Button variant="outline" size="sm" onClick={selectAll} className="shadow-sm">
                {selectedProfiles.size === publishedProfiles.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : publishedProfiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                  <Monitor className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Chưa có hồ sơ xuất bản</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">Hãy tạo và xuất bản hồ sơ trước khi trình chiếu</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {publishedProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`flex items-center gap-3 p-4 border rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all cursor-pointer hover:shadow-md ${
                      selectedProfiles.has(profile.id) 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                    onClick={() => toggleProfile(profile.id)}
                  >
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-semibold border-2 border-white shadow-sm">
                        {profile.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-slate-800 dark:text-slate-200">{profile.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDateRange(profile.birth_date, profile.death_date)}
                      </p>
                    </div>
                    <Switch
                      checked={selectedProfiles.has(profile.id)}
                      onCheckedChange={() => toggleProfile(profile.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Playlist Manager */}
        <Card className="shadow-lg border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm lg:col-span-2">
          <CardContent className="p-6">
            <PlaylistManager
              selectedProfiles={selectedProfiles}
              slideSeconds={slideSeconds}
              onPlayPlaylist={openPlaylist}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
