import { useState } from 'react';
import { useEmployees, Employee, CreateEmployeeData } from '@/hooks/useEmployees';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  UserCheck, 
  UserX,
  Loader2,
  Users,
  Eye,
  EyeOff,
  Search,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

// Validation schema
const createEmployeeSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  full_name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  phone: z.string().optional(),
  position: z.string().optional(),
});

const updateEmployeeSchema = z.object({
  full_name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  phone: z.string().optional(),
  position: z.string().optional(),
});

export const EmployeesTab = () => {
  const { 
    employees, 
    loading, 
    error, 
    fetchEmployees, 
    createEmployee, 
    updateEmployee, 
    toggleEmployeeStatus, 
    deleteEmployee 
  } = useEmployees();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state for create
  const [createForm, setCreateForm] = useState({
    email: '',
    full_name: '',
    password: '',
    phone: '',
    position: '',
  });

  // Form state for edit
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    position: '',
  });

  const resetCreateForm = () => {
    setCreateForm({
      email: '',
      full_name: '',
      password: '',
      phone: '',
      position: '',
    });
    setShowPassword(false);
  };

  const handleCreateEmployee = async () => {
    try {
      const validated = createEmployeeSchema.parse(createForm);
      setIsSubmitting(true);
      
      const { error } = await createEmployee(validated as CreateEmployeeData);
      
      if (!error) {
        setIsCreateDialogOpen(false);
        resetCreateForm();
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      const validated = updateEmployeeSchema.parse(editForm);
      setIsSubmitting(true);
      
      const { error } = await updateEmployee(selectedEmployee.id, validated);
      
      if (!error) {
        setIsEditDialogOpen(false);
        setSelectedEmployee(null);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;

    setIsSubmitting(true);
    const { error } = await deleteEmployee(selectedEmployee.id);
    setIsSubmitting(false);

    if (!error) {
      setIsDeleteDialogOpen(false);
      setSelectedEmployee(null);
    }
  };

  const handleToggleStatus = async (employee: Employee) => {
    await toggleEmployeeStatus(employee.id, !employee.is_active);
  };

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditForm({
      full_name: employee.full_name,
      phone: employee.phone || '',
      position: employee.position || '',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.position && emp.position.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchEmployees} variant="outline" className="cursor-pointer">
            <RefreshCw className="mr-2 h-4 w-4" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5" />
                Quản lý Nhân viên
              </CardTitle>
              <CardDescription>
                Tạo và quản lý tài khoản nhân viên trong hệ thống
              </CardDescription>
            </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="cursor-pointer"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Thêm nhân viên
            </Button>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, email, vị trí..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent>
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? (
                <p>Không tìm thấy nhân viên phù hợp</p>
              ) : (
                <>
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có nhân viên nào</p>
                  <p className="text-sm">Bấm "Thêm nhân viên" để tạo tài khoản mới</p>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden sm:table-cell">Vị trí</TableHead>
                    <TableHead className="hidden md:table-cell">Điện thoại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="hidden lg:table-cell">Ngày tạo</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.full_name}</TableCell>
                      <TableCell className="text-muted-foreground">{employee.email}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {employee.position || '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {employee.phone || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={employee.is_active ? 'default' : 'secondary'}
                          className={employee.is_active ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                        >
                          {employee.is_active ? 'Hoạt động' : 'Đã khóa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {formatDate(employee.created_at)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="cursor-pointer">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => openEditDialog(employee)}
                              className="cursor-pointer"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleStatus(employee)}
                              className="cursor-pointer"
                            >
                              {employee.is_active ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Khóa tài khoản
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Kích hoạt
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openDeleteDialog(employee)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
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
          )}
        </CardContent>
      </Card>

      {/* Create Employee Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm nhân viên mới</DialogTitle>
            <DialogDescription>
              Tạo tài khoản cho nhân viên mới. Họ sẽ dùng email và mật khẩu này để đăng nhập.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="create-email">Email *</Label>
              <Input
                id="create-email"
                type="email"
                placeholder="nhanvien@company.com"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-name">Họ và tên *</Label>
              <Input
                id="create-name"
                placeholder="Nguyễn Văn A"
                value={createForm.full_name}
                onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-password">Mật khẩu *</Label>
              <div className="relative">
                <Input
                  id="create-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ít nhất 6 ký tự"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-position">Vị trí / Chức vụ</Label>
              <Input
                id="create-position"
                placeholder="Nhân viên kinh doanh"
                value={createForm.position}
                onChange={(e) => setCreateForm({ ...createForm, position: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-phone">Số điện thoại</Label>
              <Input
                id="create-phone"
                placeholder="0912 345 678"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateDialogOpen(false);
                resetCreateForm();
              }}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleCreateEmployee} 
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                'Tạo tài khoản'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho {selectedEmployee?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Họ và tên *</Label>
              <Input
                id="edit-name"
                placeholder="Nguyễn Văn A"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-position">Vị trí / Chức vụ</Label>
              <Input
                id="edit-position"
                placeholder="Nhân viên kinh doanh"
                value={editForm.position}
                onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Số điện thoại</Label>
              <Input
                id="edit-phone"
                placeholder="0912 345 678"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button 
              onClick={handleEditEmployee} 
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa nhân viên <strong>{selectedEmployee?.full_name}</strong>? 
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteEmployee} 
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Xóa nhân viên'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmployeesTab;
