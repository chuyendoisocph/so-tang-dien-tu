import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const PlaylistTest = () => {
  const [testName, setTestName] = useState("Test Playlist");
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      // Test 1: Simple select
      console.log("Testing select...");
      const { data: selectData, error: selectError } = await supabase
        .from('playlists')
        .select('*')
        .limit(1);
      
      if (selectError) {
        console.error("Select error:", selectError);
        setLastResult({ type: 'select_error', error: selectError });
        toast.error(`Select failed: ${selectError.message}`);
        return;
      }
      
      console.log("Select success:", selectData);
      
      // Test 2: Insert
      console.log("Testing insert...");
      const { data: insertData, error: insertError } = await supabase
        .from('playlists')
        .insert([{
          name: testName,
          description: "Test playlist from debug",
          slide_duration: 15,
          profile_ids: [],
          auto_play: true,
          loop: true
        }])
        .select()
        .single();
      
      if (insertError) {
        console.error("Insert error:", insertError);
        setLastResult({ type: 'insert_error', error: insertError });
        toast.error(`Insert failed: ${insertError.message}`);
        return;
      }
      
      console.log("Insert success:", insertData);
      setLastResult({ type: 'success', data: insertData });
      toast.success("Playlist test thành công!");
      
    } catch (error) {
      console.error("Unexpected error:", error);
      setLastResult({ type: 'unexpected_error', error });
      toast.error("Lỗi không mong đợi");
    } finally {
      setIsLoading(false);
    }
  };

  const clearTest = async () => {
    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .ilike('name', '%Test%');
      
      if (error) {
        toast.error(`Clear failed: ${error.message}`);
      } else {
        toast.success("Đã xóa test data");
        setLastResult(null);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa test data");
    }
  };

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="text-blue-700 dark:text-blue-300">
          Playlist Database Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Test playlist name"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={testConnection}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Testing..." : "Test DB"}
          </Button>
          <Button
            variant="outline"
            onClick={clearTest}
          >
            Clear
          </Button>
        </div>
        
        {lastResult && (
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded text-xs">
            <strong>Last Result:</strong>
            <pre className="mt-1 overflow-auto">
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};