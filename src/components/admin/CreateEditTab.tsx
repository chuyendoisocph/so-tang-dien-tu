import { ArrowLeft, Plus, X, CloudUpload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface CreateEditTabProps {
  onBack: () => void;
  editingProfile?: {
    id: string;
    jobId: string;
    name: string;
  } | null;
}

export const CreateEditTab = ({ onBack, editingProfile }: CreateEditTabProps) => {
  const [roles, setRoles] = useState<string[]>([""]);
  const [locations, setLocations] = useState<string[]>([""]);

  const addRole = () => setRoles([...roles, ""]);
  const removeRole = (index: number) => setRoles(roles.filter((_, i) => i !== index));

  const addLocation = () => setLocations([...locations, ""]);
  const removeLocation = (index: number) => setLocations(locations.filter((_, i) => i !== index));

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
          <form>
            {/* Basic Info Section */}
            <h5 className="text-primary font-bold mb-6 text-lg">Thông tin cơ bản</h5>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <Label htmlFor="job_id">
                  Mã Hồ Sơ <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="job_id"
                  placeholder="Tự động tạo..."
                  readOnly
                  className="bg-muted"
                  defaultValue={editingProfile?.jobId}
                />
                <p className="text-xs text-muted-foreground">
                  Mã dùng cho link QR (Không sửa được).
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
                  defaultValue={editingProfile?.name}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_range">Niên khóa</Label>
                <Input id="date_range" placeholder="1969 - 2025" />
              </div>
            </div>

            {/* Image Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <Label>Ảnh chân dung (Avatar)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                  <CloudUpload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    <span className="text-primary font-semibold">Nhấn để chọn</span> hoặc kéo thả ảnh vào đây
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ảnh bìa (Cover)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    <span className="text-primary font-semibold">Nhấn để chọn</span> hoặc kéo thả ảnh vào đây
                  </p>
                </div>
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
                  {roles.map((_, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded-lg">
                      <Input
                        placeholder={`Chức vụ ${index + 1}`}
                        className="flex-1"
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
                  {locations.map((_, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded-lg">
                      <Input
                        placeholder={`Địa điểm ${index + 1}`}
                        className="flex-1"
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
              <Button type="button" variant="secondary" onClick={onBack} className="sm:order-1">
                Hủy
              </Button>
              <Button type="submit" className="shadow-sm sm:order-2">
                Lưu Hồ Sơ
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
