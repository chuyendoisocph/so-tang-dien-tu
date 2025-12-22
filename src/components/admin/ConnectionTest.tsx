import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Wifi, WifiOff, AlertCircle, CheckCircle } from "lucide-react";

export const ConnectionTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [lastError, setLastError] = useState<any>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setLastError(null);
    
    try {
      console.log("Testing Supabase connection...");
      
      // Test 1: Basic connection
      const { data: healthCheck, error: healthError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (healthError) {
        console.error("Connection error:", healthError);
        setConnectionStatus('error');
        setLastError(healthError);
        toast.error(`Connection failed: ${healthError.message}`);
        return;
      }
      
      console.log("Connection successful");
      setConnectionStatus('connected');
      toast.success("Kết nối Supabase thành công!");
      
    } catch (error) {
      console.error("Unexpected error:", error);
      setConnectionStatus('error');
      setLastError(error);
      toast.error("Lỗi kết nối không mong đợi");
    } finally {
      setIsLoading(false);
    }
  };

  const checkEnvironment = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    console.log("Environment check:");
    console.log("SUPABASE_URL:", url);
    console.log("SUPABASE_KEY:", key ? `${key.substring(0, 20)}...` : 'NOT SET');
    
    if (!url || !key) {
      toast.error("Thiếu Supabase environment variables!");
      return false;
    }
    
    toast.success("Environment variables OK");
    return true;
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <WifiOff className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return "Kết nối thành công";
      case 'error':
        return "Lỗi kết nối";
      default:
        return "Chưa kiểm tra";
    }
  };

  return (
    <Card className="mb-4 border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <Wifi className="h-5 w-5" />
          Supabase Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={checkEnvironment}
            variant="outline"
            size="sm"
          >
            Check Env
          </Button>
          <Button
            onClick={testConnection}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
            size="sm"
          >
            {isLoading ? "Testing..." : "Test Connection"}
          </Button>
        </div>
        
        {lastError && (
          <div className="p-3 bg-red-100 dark:bg-red-900 rounded text-xs">
            <strong>Error Details:</strong>
            <pre className="mt-1 overflow-auto max-h-32">
              {JSON.stringify(lastError, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="text-xs text-purple-600 dark:text-purple-400">
          <strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL}
        </div>
      </CardContent>
    </Card>
  );
};