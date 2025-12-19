import { useState } from "react";
import { toast } from "sonner";
import { Play, Settings, Monitor, Clock, RotateCcw, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAllProfiles } from "@/hooks/useProfiles";

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

  const openStandee = () => {
    const profileIds = Array.from(selectedProfiles).join(",");
    const url = `/slideshow?time=${slideSeconds}${profileIds ? `&profiles=${profileIds}` : ""}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Đã mở Standee Mode");
  };

  const openProfileMode = () => {
    const profileIds = Array.from(selectedProfiles).join(",");
    const url = `/slideshow-profile?time=${slideSeconds}${profileIds ? `&profiles=${profileIds}` : ""}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Đã mở Profile Mode");
  };

  const formatDateRange = (birthDate: string | null, deathDate: string | null) => {
    const birth = birthDate ? new Date(birthDate).getFullYear() : "?";
    const death = deathDate ? new Date(deathDate).getFullYear() : "?";
    return `${birth} - ${death}`;
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cấu hình Trình chiếu</h1>
          <p className="text-muted-foreground">Thiết lập hiển thị cho màn hình TV Standee.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="flex-1 sm:flex-initial"
            onClick={openStandee}
            disabled={selectedProfiles.size === 0}
          >
            <Monitor className="h-4 w-4 mr-2" />
            Standee Mode
          </Button>
          <Button
            className="flex-1 sm:flex-initial shadow-sm"
            onClick={openProfileMode}
            disabled={selectedProfiles.size === 0}
          >
            <Play className="h-4 w-4 mr-2" />
            Profile Mode
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Card */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5 text-primary" />
              Cài đặt chung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Tự động chạy</Label>
                <p className="text-sm text-muted-foreground">Bắt đầu trình chiếu khi tải trang</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Lặp lại</Label>
                <p className="text-sm text-muted-foreground">Quay lại đầu khi hết danh sách</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Thời gian mỗi slide (giây)
              </Label>
              <Input
                type="number"
                value={slideSeconds}
                min={5}
                max={60}
                onChange={(e) => setSlideSeconds(Math.max(5, Math.min(60, Number(e.target.value) || 0)))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Slideshow Types Card */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="h-5 w-5 text-primary" />
              Chế độ trình chiếu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Standee Mode */}
            <div
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={openStandee}
              onKeyDown={(e) => e.key === 'Enter' && openStandee()}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-28 bg-gradient-to-b from-memorial-hero-from to-memorial-hero-to rounded flex-shrink-0 flex flex-col items-center justify-center p-2">
                  <div className="text-gold text-[6px] font-semibold uppercase">Tưởng Niệm</div>
                  <div className="w-6 h-8 bg-foreground/20 rounded mt-1" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">Standee Mode</h4>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Hiển thị dạng Standee TV dọc 1080x1920, nền gradient tối với ảnh chân dung và QR code.
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Mode */}
            <div
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              role="button"
              tabIndex={0}
              onClick={openProfileMode}
              onKeyDown={(e) => e.key === 'Enter' && openProfileMode()}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-28 bg-gradient-to-b from-memorial-standee-from to-memorial-standee-to rounded flex-shrink-0 flex flex-col items-center p-2">
                  <div className="w-full h-6 bg-foreground/20 rounded-t" />
                  <div className="w-6 h-6 bg-foreground/30 rounded-full -mt-3 border-2 border-card" />
                  <div className="w-10 h-2 bg-foreground/20 rounded mt-1" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">Profile Mode</h4>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Trình chiếu các trang Profile đầy đủ với tiểu sử và lời chia buồn, phù hợp màn hình ngang.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Selection */}
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-lg">
                <RotateCcw className="h-5 w-5 text-primary" />
                Danh sách Hồ sơ trong Trình chiếu
                {selectedProfiles.size > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({selectedProfiles.size} đã chọn)
                  </span>
                )}
              </span>
              <Button variant="outline" size="sm" onClick={selectAll}>
                {selectedProfiles.size === publishedProfiles.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : publishedProfiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Chưa có hồ sơ nào được xuất bản.</p>
                <p className="text-sm">Hãy tạo và xuất bản hồ sơ trước khi trình chiếu.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {publishedProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                      selectedProfiles.has(profile.id) ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => toggleProfile(profile.id)}
                  >
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {profile.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{profile.name}</p>
                      <p className="text-sm text-muted-foreground">
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
      </div>
    </div>
  );
};
