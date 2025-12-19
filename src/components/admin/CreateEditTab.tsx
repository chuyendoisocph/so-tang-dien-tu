import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
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
  const [coverUrl, setCoverUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
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
      setCoverUrl(existingProfile.cover_url || "");
      setIsPublished(existingProfile.is_published || false);
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

            {/* Row 1: Name and Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">
                  Họ và Tên <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="full_name"
                  placeholder="VD: Hoàng Nam Tiến"
                  className="font-semibold"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Mã Hồ Sơ</Label>
                <Input
                  id="slug"
                  placeholder="Tự động tạo từ họ tên..."
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value.toUpperCase())}
                  className="font-mono uppercase"
                />
                <p className="text-xs text-muted-foreground">
                  Mã dùng cho link QR. Tự động tạo hoặc nhập tùy chỉnh.
                </p>
              </div>
            </div>

            {/* Row 2: Years and Publish */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="space-y-2">
                <Label htmlFor="birth_year">Năm sinh</Label>
                <Input
                  id="birth_year"
                  type="number"
                  placeholder="1960"
                  min={1800}
                  max={new Date().getFullYear()}
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="text-center"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="death_year">Năm mất</Label>
                <Input
                  id="death_year"
                  type="number"
                  placeholder="2025"
                  min={1800}
                  max={new Date().getFullYear() + 1}
                  value={deathYear}
                  onChange={(e) => setDeathYear(e.target.value)}
                  className="text-center"
                />
              </div>

              <div className="col-span-2 flex items-end">
                <div className="flex items-center justify-between w-full p-3 rounded-lg border bg-muted/30">
                  <div>
                    <Label className="font-medium">Xuất bản</Label>
                    <p className="text-xs text-muted-foreground">
                      Hiển thị công khai
                    </p>
                  </div>
                  <Switch
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                </div>
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
                  aspectRatio="square"
                  placeholder="Nhấn hoặc kéo thả ảnh vào đây"
                />
              </div>

              <div className="space-y-2">
                <Label>Ảnh bìa (Cover)</Label>
                <ImageUpload
                  value={coverUrl}
                  onChange={setCoverUrl}
                  onRemove={() => setCoverUrl("")}
                  aspectRatio="square"
                  placeholder="Nhấn hoặc kéo thả ảnh vào đây"
                />
              </div>
            </div>

            {/* Detail Section */}
            <h5 className="text-primary font-bold mb-6 text-lg">Nội dung chi tiết</h5>

            <div className="mb-6">
              <Label htmlFor="biography">Tiểu sử (Web)</Label>
              <Textarea
                id="biography"
                className="mt-2 min-h-[200px]"
                placeholder="Nhập tiểu sử..."
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Roles */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Danh sách Chức vụ (TV)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addRole}>
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm
                  </Button>
                </div>
                <div className="border rounded-lg p-4 bg-card space-y-2 max-h-64 overflow-y-auto">
                  {roles.map((role, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded-lg">
                      <Input
                        placeholder={`Chức vụ ${index + 1}`}
                        className="flex-1"
                        value={role}
                        onChange={(e) => updateRole(index, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRole(index)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Địa điểm tổ chức (TV)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLocation}>
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm
                  </Button>
                </div>
                <div className="border rounded-lg p-4 bg-card space-y-2 max-h-64 overflow-y-auto">
                  {locations.map((location, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded-lg">
                      <Input
                        placeholder={`Địa điểm ${index + 1}`}
                        className="flex-1"
                        value={location}
                        onChange={(e) => updateLocation(index, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLocation(index)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
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
