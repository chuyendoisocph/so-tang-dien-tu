import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const DatabaseSetup = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [needsPolicy, setNeedsPolicy] = useState(false);

  const checkTableExists = async () => {
    setIsChecking(true);
    try {
      // First check if table exists
      const { data, error } = await supabase
        .from('playlists')
        .select('id')
        .limit(1);
      
      if (error) {
        if (error.code === 'PGRST116' || error.code === 'PGRST205') {
          // Table doesn't exist
          setTableExists(false);
          setNeedsPolicy(false);
          return false;
        } else if (error.code === '42501' || error.message.includes('permission denied')) {
          // Table exists but no RLS policy
          setTableExists(true);
          setNeedsPolicy(true);
          return false;
        } else {
          console.error('Unknown error:', error);
          setTableExists(false);
          setNeedsPolicy(false);
          return false;
        }
      } else {
        // Table exists and accessible
        setTableExists(true);
        setNeedsPolicy(false);
        return true;
      }
    } catch (error) {
      console.error('Error checking table:', error);
      setTableExists(false);
      setNeedsPolicy(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // Check table on component mount
  useEffect(() => {
    checkTableExists();
  }, []);

  const copyTableSQL = () => {
    const sql = `CREATE TABLE playlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slide_duration INTEGER NOT NULL DEFAULT 15,
    profile_ids TEXT[] NOT NULL DEFAULT '{}',
    auto_play BOOLEAN NOT NULL DEFAULT true,
    loop BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_playlists_created_at ON playlists(created_at DESC);`;
        
    navigator.clipboard.writeText(sql);
    toast.success("SQL tạo table đã được copy!");
  };

  const copyPolicySQL = () => {
    const sql = `-- Setup RLS policy cho table playlists
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on playlists" ON playlists;

CREATE POLICY "Allow all operations on playlists" ON playlists 
FOR ALL USING (true);`;
        
    navigator.clipboard.writeText(sql);
    toast.success("SQL setup policy đã được copy!");
  };

  // Don't render if table exists and working
  if (tableExists === true && !needsPolicy) {
    return null;
  }

  // Show loading state
  if (isChecking) {
    return (
      <Card className="mb-4 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Đang kiểm tra database...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show setup card if table doesn't exist or needs policy
  return (
    <Card className="mb-4 border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
          <Database className="h-5 w-5" />
          {needsPolicy ? "Database Policy Setup Required" : "Database Setup Required"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-sm">
            {needsPolicy 
              ? "Table 'playlists' tồn tại nhưng cần setup RLS policy."
              : "Table 'playlists' chưa tồn tại. Cần tạo table để sử dụng tính năng playlist."
            }
          </span>
        </div>
        
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={checkTableExists}
            disabled={isChecking}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            {isChecking ? "Đang kiểm tra..." : "Kiểm tra lại"}
          </Button>
          
          {!tableExists && (
            <Button
              size="sm"
              onClick={copyTableSQL}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Copy SQL Tạo Table
            </Button>
          )}
          
          {needsPolicy && (
            <Button
              size="sm"
              onClick={copyPolicySQL}
              className="bg-red-600 hover:bg-red-700"
            >
              Copy SQL Setup Policy
            </Button>
          )}
        </div>
        
        <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            <strong>Hướng dẫn:</strong>
            <br />
            {needsPolicy ? (
              <>
                1. Nhấn "Copy SQL Setup Policy" để copy câu lệnh setup policy
                <br />
                2. Mở Supabase Dashboard → SQL Editor
                <br />
                3. Paste SQL và chạy (Run)
                <br />
                4. Quay lại đây và nhấn "Kiểm tra lại"
              </>
            ) : (
              <>
                1. Nhấn "Copy SQL Tạo Table" để copy câu lệnh tạo table
                <br />
                2. Mở Supabase Dashboard → SQL Editor
                <br />
                3. Paste SQL và chạy (Run)
                <br />
                4. Sau đó chạy thêm policy setup (sẽ hiện sau khi tạo table)
                <br />
                5. Quay lại đây và nhấn "Kiểm tra lại"
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};