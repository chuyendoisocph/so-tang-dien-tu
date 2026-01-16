import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Shield, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

// Email and password validation schema
const authSchema = z.object({
  email: z.string().trim().email({ message: 'Email không hợp lệ' }).max(255, { message: 'Email quá dài' }),
  password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }).max(100, { message: 'Mật khẩu quá dài' }),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signIn, isAdmin, isEmployee } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      // User is logged in, check role and redirect
      if (isAdmin || isEmployee) {
        navigate('/');
      }
    }
  }, [user, authLoading, isAdmin, isEmployee, navigate]);

  const validateInputs = () => {
    try {
      authSchema.parse({ email, password });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) return;
    
    setLoading(true);
    const { error } = await signIn(email, password);

    if (error) {
      setLoading(false);
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Email hoặc mật khẩu không đúng');
      } else {
        toast.error('Đăng nhập thất bại: ' + error.message);
      }
    } else {
      toast.success('Đăng nhập thành công!');
      // Redirect will happen via useEffect when auth state updates
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is logged in but has no role, show message
  if (user && !isAdmin && !isEmployee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="h-16 w-16 mx-auto bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-xl">Không có quyền truy cập</CardTitle>
            <CardDescription className="text-base">
              Tài khoản của bạn chưa được cấp quyền. Vui lòng liên hệ quản trị viên.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full cursor-pointer" 
              variant="outline"
              onClick={async () => {
                const auth = useAuth();
                await auth.signOut();
                window.location.reload();
              }}
            >
              Đăng xuất
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="h-20 w-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">CPHACO Admin</CardTitle>
          <CardDescription className="text-base">
            Đăng nhập để quản lý Sổ Tang điện tử
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email-login" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email-login"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-login" className="text-sm font-medium">
                Mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="password-login"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-11 pr-10"
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
            <Button 
              type="submit" 
              className="w-full h-11 font-medium cursor-pointer" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>
          
          <p className="text-sm text-muted-foreground text-center mt-6">
            Liên hệ quản trị viên nếu bạn cần tài khoản
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
