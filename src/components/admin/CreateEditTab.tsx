import { ArrowLeft, Loader2 } from "lucide-react";
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
  } | null;
}

export const CreateEditTab = ({ onBack, editingProfile }: CreateEditTabProps) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [biography, setBiography] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const { data: existingProfile, isLoading: isLoadingProfile } = useProfile(editingProfile?.id || null);
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();

  const isSubmitting = createProfile.isPending || updateProfile.isPending;

  // Load existing profile data when editing
  useEffect(() => {
    if (existingProfile) {
      setName(existingProfile.name || "");
      setSlug(existingProfile.slug || "");
      setBirthDate(existingProfile.birth_date || "");
      setDeathDate(existingProfile.death_date || "");
      setBiography(existingProfile.biography || "");
      setAvatarUrl(existingProfile.avatar_url || "");
      setCoverUrl(existingProfile.cover_url || "");
      setIsPublished(existingProfile.is_published || false);
    }
  }, [existingProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      name,
      slug,
      birth_date: birthDate || undefined,
      death_date: deathDate || undefined,
      biography,
      avatar_url: avatarUrl || undefined,
      cover_url: coverUrl || undefined,
      is_published: isPublished,
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
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {editingProfile ? "Chỉnh sửa Hồ Sơ" : "Tạo Hồ Sơ Mới"}
          </h1>
          <p className="text-muted-foreground hidden sm:block">
            Nhập thông tin chi tiết để hiển thị.
          </p>
        </div>
        <Button variant="outline" onClick={onBack} className="bg-card">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </div>

      {/* Form Card */}
      <Card className="shadow-card">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            {/* Basic Info Section */}
            <h5 className="text-primary font-bold mb-6 text-lg">Thông tin cơ bản</h5>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <Label htmlFor="slug">
                  Mã Hồ Sơ
                </Label>
                <Input
                  id="slug"
                  placeholder="Tự động tạo nếu để trống..."
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Mã dùng cho link QR.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">
                  Họ và Tên <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="full_name"
                  placeholder="VD: Hoàng Nam Tiến"
                  className="font-semibold"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Xuất bản</Label>
                  <Switch
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Hiển thị công khai trên trang web.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <Label htmlFor="birth_date">Ngày sinh</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="death_date">Ngày mất</Label>
                <Input
                  id="death_date"
                  type="date"
                  value={deathDate}
                  onChange={(e) => setDeathDate(e.target.value)}
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <Label>Ảnh chân dung (Avatar)</Label>
                <ImageUpload
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  onRemove={() => setAvatarUrl("")}
                  aspectRatio="portrait"
                  placeholder="Nhấn hoặc kéo thả ảnh vào đây"
                />
              </div>

              <div className="space-y-2">
                <Label>Ảnh bìa (Cover)</Label>
                <ImageUpload
                  value={coverUrl}
                  onChange={setCoverUrl}
                  onRemove={() => setCoverUrl("")}
                  aspectRatio="video"
                  placeholder="Nhấn hoặc kéo thả ảnh vào đây"
                />
              </div>
            </div>

            {/* Detail Section */}
            <h5 className="text-primary font-bold mb-6 text-lg">Nội dung chi tiết</h5>

            <div className="mb-8">
              <Label htmlFor="biography">Tiểu sử</Label>
              <Textarea
                id="biography"
                className="mt-2 min-h-[200px]"
                placeholder="Nhập tiểu sử..."
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="secondary" onClick={onBack} className="sm:order-1" disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type="submit" className="shadow-sm sm:order-2" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingProfile ? "Cập nhật Hồ Sơ" : "Lưu Hồ Sơ"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
