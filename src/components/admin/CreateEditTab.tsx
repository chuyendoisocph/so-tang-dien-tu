import { ArrowLeft, Loader2, Plus, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { ImageUpload } from "@/components/ui/image-upload";
import { useProfile, useCreateProfile, useUpdateProfile } from "@/hooks/useProfiles";

interface CreateEditTabProps {
  onBack: () => void;
  editingProfile?: {
    id: string;
    jobId: string;
    name: string;
    isCelebrity?: boolean;
  } | null;
}

// Remove Vietnamese diacritics
function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');
}

// Generate slug from name (lowercase, no spaces, no diacritics)
function generateSlug(name: string): string {
  if (!name.trim()) return "";
  return removeVietnameseTones(name)
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export const CreateEditTab = ({ onBack, editingProfile }: CreateEditTabProps) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [deathYear, setDeathYear] = useState("");
  const [biography, setBiography] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [isBuried, setIsBuried] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isCelebrity, setIsCelebrity] = useState(editingProfile?.isCelebrity || false);
  const [roles, setRoles] = useState<string[]>([""]);
  const [locations, setLocations] = useState<string[]>([""]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const { data: existingProfile, isLoading: isLoadingProfile } = useProfile(editingProfile?.id || null);
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();

  const isSubmitting = createProfile.isPending || updateProfile.isPending;

  // Auto-generate slug when name changes (only if not manually edited)
  const handleNameChange = (newName: string) => {
    setName(newName);
    if (!slugManuallyEdited && !editingProfile) {
      setSlug(generateSlug(newName));
    }
  };

  const handleSlugChange = (newSlug: string) => {
    setSlug(newSlug.toLowerCase().replace(/\s+/g, ''));
    setSlugManuallyEdited(true);
  };

  // Role handlers
  const addRole = () => setRoles([...roles, ""]);
  const removeRole = (index: number) => setRoles(roles.filter((_, i) => i !== index));
  const updateRole = (index: number, value: string) => {
    const newRoles = [...roles];
    newRoles[index] = value;
    setRoles(newRoles);
  };

  // Location handlers
  const addLocation = () => setLocations([...locations, ""]);
  const removeLocation = (index: number) => setLocations(locations.filter((_, i) => i !== index));
  const updateLocation = (index: number, value: string) => {
    const newLocations = [...locations];
    newLocations[index] = value;
    setLocations(newLocations);
  };

  // Load existing profile data when editing
  useEffect(() => {
    if (existingProfile) {
      setName(existingProfile.name || "");
      setSlug(existingProfile.slug || "");
      setSlugManuallyEdited(true); // Don't auto-generate when editing
      // Extract year from date strings
      setBirthYear(existingProfile.birth_date ? new Date(existingProfile.birth_date).getFullYear().toString() : "");
      setDeathYear(existingProfile.death_date ? new Date(existingProfile.death_date).getFullYear().toString() : "");
      setBiography(existingProfile.biography || "");
      setAvatarUrl(existingProfile.avatar_url || "");
      setMapsUrl(existingProfile.maps_url || "");
      setIsBuried(existingProfile.is_buried || false);
      setIsPublished(existingProfile.is_published || false);
      setIsCelebrity(existingProfile.is_celebrity || false);
    }
  }, [existingProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert year to date format (using January 1st of that year)
    const birthDate = birthYear ? `${birthYear}-01-01` : undefined;
    const deathDate = deathYear ? `${deathYear}-01-01` : undefined;

    const formData = {
      name,
      slug,
      birth_date: birthDate,
      death_date: deathDate,
      biography,
      avatar_url: avatarUrl || undefined,
      maps_url: mapsUrl || undefined,
      is_buried: isBuried,
      is_published: isPublished,
      is_celebrity: isCelebrity,
    };

    if (editingProfile?.id) {
      await updateProfile.mutateAsync({ id: editingProfile.id, formData });
    } else {
      await createProfile.mutateAsync(formData);
    }

    onBack();
  };

  if (isLoadingProfile && editingProfile?.id) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {editingProfile ? "Chỉnh sửa Hồ Sơ" : "Tạo Hồ Sơ Mới"}
            </h1>
            {isCelebrity && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                <Star className="h-3 w-3 fill-amber-500" />
                Người nổi tiếng
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            {editingProfile ? `Cập nhật thông tin cho ${editingProfile.name}` : "Nhập thông tin chi tiết để tạo trang tưởng niệm"}
          </p>
        </div>
        <Button variant="outline" onClick={onBack} className="bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all cursor-pointer">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Button>
      </div>

      {/* Form Card */}
      <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Profile Overview (Basic Info + Image) */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-xs">1</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Thông tin hồ sơ</h3>
              </div>

              {/* Row 1: Name and Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Họ và Tên <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    placeholder="VD: Hoàng Nam Tiến"
                    className="font-semibold border-slate-300 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Mã Hồ Sơ
                  </Label>
                  <Input
                    id="slug"
                    placeholder="Tự động tạo từ họ tên..."
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value.toUpperCase())}
                    className="font-mono uppercase border-slate-300 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Mã dùng cho link QR. Tự động tạo hoặc nhập tùy chỉnh.
                  </p>
                </div>
              </div>

              {/* Row 2: Years */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="birth_year" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Năm sinh
                  </Label>
                  <Input
                    id="birth_year"
                    type="number"
                    placeholder="1960"
                    min={1800}
                    max={new Date().getFullYear()}
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="text-center border-slate-300 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="death_year" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Năm mất
                  </Label>
                  <Input
                    id="death_year"
                    type="number"
                    placeholder="2025"
                    min={1800}
                    max={new Date().getFullYear() + 1}
                    value={deathYear}
                    onChange={(e) => setDeathYear(e.target.value)}
                    className="text-center border-slate-300 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80"
                  />
                </div>
              </div>

              {/* Avatar Image */}
              <div className="pt-2">
                <div className="max-w-sm mx-auto">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Ảnh chân dung (Avatar)
                    </Label>
                    <ImageUpload
                      value={avatarUrl}
                      onChange={setAvatarUrl}
                      onRemove={() => setAvatarUrl("")}
                      aspectRatio="square"
                      placeholder="Nhấn hoặc kéo thả ảnh vào đây"
                    />
                    <p className="text-xs text-slate-500 text-center">Khuyến nghị: 400x400px, định dạng JPG/PNG</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Content - Different for Celebrity vs Regular */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCelebrity ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10' : 'bg-gradient-to-br from-purple-500/20 to-purple-600/10'}`}>
                  <span className={`font-bold text-sm ${isCelebrity ? 'text-amber-600' : 'text-purple-600'}`}>2</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Nội dung</h3>
              </div>

              <div className="space-y-3">
                <Label htmlFor="biography" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {isCelebrity ? 'Tiểu sử & Thành tựu' : 'Tiểu sử / Thông tin an táng'}
                </Label>
                <Textarea
                  id="biography"
                  className="min-h-[200px] border-slate-300 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80"
                  placeholder={isCelebrity 
                    ? "Nhập tiểu sử, sự nghiệp, thành tựu nổi bật của nhân vật..." 
                    : "Nhập tiểu sử, thông tin an táng, kỷ niệm đáng nhớ..."}
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                />
                <p className="text-xs text-slate-500">
                  {isCelebrity 
                    ? 'Mô tả cuộc đời, sự nghiệp và những đóng góp nổi bật' 
                    : 'Mô tả cuộc đời, thông tin an táng và những kỷ niệm đáng nhớ'}
                </p>
              </div>

              {/* Only show location fields for regular profiles (not celebrities) */}
              {!isCelebrity && (
                <>
                  <div className="space-y-3">
                    <Label htmlFor="mapsUrl" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Link Google Maps (Vị trí An Nghỉ)
                    </Label>
                    <Input
                      id="mapsUrl"
                      type="url"
                      className="border-slate-300 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80"
                      placeholder="https://maps.app.goo.gl/..."
                      value={mapsUrl}
                      onChange={(e) => setMapsUrl(e.target.value)}
                    />
                    <p className="text-xs text-slate-500">Link Google Maps để hiển thị QR code chỉ đường (không bắt buộc)</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50/80 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex-1">
                      <Label htmlFor="isBuried" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        Đã an táng
                      </Label>
                      <p className="text-xs text-slate-500 mt-1">
                        Bật nếu người đã được an táng (hiển thị "được an nghỉ tại"), tắt nếu chưa (hiển thị "sẽ được an nghỉ tại")
                      </p>
                    </div>
                    <Switch
                      id="isBuried"
                      checked={isBuried}
                      onCheckedChange={setIsBuried}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Publish Section - At the end before actions */}
            <div className="pt-4 space-y-4">
              {/* Celebrity Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 shadow-sm">
                <div className="flex-1">
                  <Label htmlFor="isCelebrity" className="text-base font-semibold text-amber-700 dark:text-amber-300 cursor-pointer flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Người nổi tiếng
                  </Label>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                    Bật nếu đây là nhân vật nổi tiếng, lịch sử hoặc VIP
                  </p>
                </div>
                <Switch
                  id="isCelebrity"
                  checked={isCelebrity}
                  onCheckedChange={setIsCelebrity}
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 shadow-sm">
                <div className="flex-1">
                  <Label htmlFor="isPublished" className="text-base font-semibold text-green-700 dark:text-green-300 cursor-pointer">
                    Xuất bản hồ sơ
                  </Label>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Bật để hiển thị hồ sơ công khai trên web. Tắt để lưu nháp.
                  </p>
                </div>
                <Switch
                  id="isPublished"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-8 border-t border-slate-200 dark:border-slate-700">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onBack} 
                className="sm:order-1 bg-white/50 backdrop-blur-sm" 
                disabled={isSubmitting}
              >
                Hủy bỏ
              </Button>
              <Button 
                type="submit" 
                className="shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 sm:order-2" 
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingProfile ? "Cập nhật Hồ Sơ" : "Lưu Hồ Sơ Mới"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
