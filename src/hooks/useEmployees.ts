import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Employee {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string;
  phone: string | null;
  position: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
}

export interface CreateEmployeeData {
  email: string;
  full_name: string;
  phone?: string;
  position?: string;
  password: string;
}

export interface UpdateEmployeeData {
  full_name?: string;
  phone?: string;
  position?: string;
  is_active?: boolean;
}

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setEmployees(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách nhân viên';
      setError(message);
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const createEmployee = async (data: CreateEmployeeData) => {
    try {
      // 1. Create auth user via Supabase Admin API (requires edge function)
      // For now, we'll use signUp and then assign role
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
          }
        }
      });

      if (authError) {
        throw new Error(`Không thể tạo tài khoản: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Không thể tạo tài khoản người dùng');
      }

      // 2. Create employee record
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .insert({
          user_id: authData.user.id,
          email: data.email,
          full_name: data.full_name,
          phone: data.phone || null,
          position: data.position || null,
        })
        .select()
        .single();

      if (employeeError) {
        throw new Error(`Không thể tạo hồ sơ nhân viên: ${employeeError.message}`);
      }

      // 3. Assign employee role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'employee' as const,
        });

      if (roleError) {
        throw new Error(`Không thể gán quyền nhân viên: ${roleError.message}`);
      }

      toast.success('Tạo tài khoản nhân viên thành công!');
      await fetchEmployees();
      return { data: employeeData, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tạo nhân viên';
      toast.error(message);
      return { data: null, error: message };
    }
  };

  const updateEmployee = async (id: string, data: UpdateEmployeeData) => {
    try {
      const { data: updated, error: updateError } = await supabase
        .from('employees')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      toast.success('Cập nhật thông tin nhân viên thành công!');
      await fetchEmployees();
      return { data: updated, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật nhân viên';
      toast.error(message);
      return { data: null, error: message };
    }
  };

  const toggleEmployeeStatus = async (id: string, isActive: boolean) => {
    return updateEmployee(id, { is_active: isActive });
  };

  const deleteEmployee = async (id: string) => {
    try {
      // Get employee to find user_id
      const employee = employees.find(e => e.id === id);
      
      // Delete employee record (cascade will handle user_roles)
      const { error: deleteError } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Note: To fully delete the auth user, you'd need an edge function
      // with admin privileges. The employee record deletion is sufficient
      // for disabling access since they can't pass role checks.

      toast.success('Xóa nhân viên thành công!');
      await fetchEmployees();
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xóa nhân viên';
      toast.error(message);
      return { error: message };
    }
  };

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    toggleEmployeeStatus,
    deleteEmployee,
  };
}
