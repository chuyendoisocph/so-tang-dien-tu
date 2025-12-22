import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const ProfileTest = () => {
  const [testName, setTestName] = useState("Test Profile");
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const testProfileCreation = async () => {
    setIsLoading(true);
    try {
      console.log("Testing profile creation...");
      
      const profileData = {
        name: testName,
        slug: testName.toLowerCase().replace(/\s+/g, ''),
        birth_date: "1990-01-01",
        death_date: "2025-01-01",
        biography: "Test biography",
        is_published: false
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();
      
      if (error) {
        console.error("Profile creation error:", error);
        setLastResult({ type: 'error', error });
        toast.error(`Profile creation failed: ${error.message}`);
        return;
      }
      
      console.log("Profile creation success:", data);
      setLastResult({ type: 'success', data });
      toast.success("Profile test thành công!");
      
    } catch (error) {
      console.error("Unexpected error:", error);
      setLastResult({ type: 'unexpected_error', error });
      toast.error("Lỗi không mong đợi");
    } finally {
      setIsLoading(false);
    }
  };

  const clearTestProfiles = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .ilike('name', '%Test%');
      
      if (error) {
        toast.error(`Clear failed: ${error.message}`);
      } else {
        toast.success("Đã xóa test profiles");
        setLastResult(null);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa test profiles");
    }
  };

  return (
    <Card className="mb-4 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
      <CardHeader>
        <CardTitle className="text-green-700 dark:text-green-300">
          Profile Creation Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Test profile name"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={testProfileCreation}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Testing..." : "Test Profile"}
          </Button>
          <Button
            variant="outline"
            onClick={clearTestProfiles}
          >
            Clear
          </Button>
        </div>
        
        {lastResult && (
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded text-xs">
            <strong>Last Result:</strong>
            <pre className="mt-1 overflow-auto max-h-32">
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};