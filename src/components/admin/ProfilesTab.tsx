import { Plus, Eye, Edit, Trash2, MoreHorizontal, ExternalLink } from "lucide-react";
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

interface Profile {
  id: string;
  jobId: string;
  name: string;
  createdAt: string;
}

interface ProfilesTabProps {
  onCreateNew: () => void;
  onEdit: (profile: Profile) => void;
}

// Mock data
const mockProfiles: Profile[] = [
  { id: "1", jobId: "HNT2025", name: "Hoàng Nam Tiến", createdAt: "15/12/2025" },
  { id: "2", jobId: "NVA2025", name: "Nguyễn Văn An", createdAt: "14/12/2025" },
  { id: "3", jobId: "TTB2025", name: "Trần Thị Bình", createdAt: "13/12/2025" },
];

export const ProfilesTab = ({ onCreateNew, onEdit }: ProfilesTabProps) => {
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
                  <TableHead className="font-semibold text-muted-foreground uppercase text-xs">Ngày tạo</TableHead>
                  <TableHead className="font-semibold text-muted-foreground uppercase text-xs text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockProfiles.map((profile, index) => (
                  <TableRow key={profile.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded font-mono text-sm">
                        {profile.jobId}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold">{profile.name}</TableCell>
                    <TableCell className="text-muted-foreground">{profile.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(`/profile/${profile.jobId}`, '_blank')}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem trang
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(`/profile/${profile.jobId}?kiosk=1`, '_blank')}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Xem chế độ Kiosk
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onEdit(profile)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {mockProfiles.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Chưa có hồ sơ nào. Nhấn "Tạo mới" để bắt đầu.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
