import { useState } from 'react';
import { useComments } from '@/hooks/useComments';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const CommentTest = () => {
  const [testProfileId, setTestProfileId] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [testResults, setTestResults] = useState<string[]>([]);
  
  const { comments, loading, addComment, refetch } = useComments(testProfileId);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDatabaseConnection = async () => {
    try {
      addTestResult('Testing database connection...');
      const { data, error } = await supabase.from('profiles').select('id, name').limit(1);
      
      if (error) {
        addTestResult(`❌ Database connection failed: ${error.message}`);
      } else {
        addTestResult(`✅ Database connection successful. Found ${data?.length || 0} profiles`);
        if (data && data.length > 0) {
          setTestProfileId(data[0].id);
          addTestResult(`📝 Auto-set test profile ID: ${data[0].id} (${data[0].name})`);
        }
      }
    } catch (err) {
      addTestResult(`❌ Connection test error: ${err}`);
    }
  };

  const testDirectInsert = async () => {
    if (!testProfileId) {
      toast.error('Vui lòng nhập Profile ID');
      return;
    }

    try {
      addTestResult('Testing direct insert to comments table...');
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          profile_id: testProfileId,
          author_name: 'Direct Test User',
          author_email: '0901111111',
          content: 'Direct insert test comment',
          is_approved: true,
          is_public: true,
        })
        .select()
        .single();

      if (error) {
        addTestResult(`❌ Direct insert failed: ${error.message}`);
        console.error('Direct insert error:', error);
      } else {
        addTestResult(`✅ Direct insert successful! Comment ID: ${data.id}`);
        console.log('Direct insert success:', data);
        await refetch();
      }
    } catch (err) {
      addTestResult(`❌ Direct insert error: ${err}`);
      console.error('Direct insert exception:', err);
    }
  };

  const testRLSPolicies = async () => {
    try {
      addTestResult('Testing RLS policies...');
      
      // Test SELECT permission
      const { data: selectData, error: selectError } = await supabase
        .from('comments')
        .select('*')
        .limit(1);
        
      if (selectError) {
        addTestResult(`❌ SELECT permission denied: ${selectError.message}`);
      } else {
        addTestResult(`✅ SELECT permission OK. Found ${selectData?.length || 0} comments`);
      }

      // Test INSERT permission with minimal data
      const { data: insertData, error: insertError } = await supabase
        .from('comments')
        .insert({
          profile_id: testProfileId || '00000000-0000-0000-0000-000000000000',
          author_name: 'RLS Test',
          content: 'RLS test comment',
        })
        .select()
        .single();

      if (insertError) {
        addTestResult(`❌ INSERT permission denied: ${insertError.message}`);
      } else {
        addTestResult(`✅ INSERT permission OK. Comment ID: ${insertData.id}`);
      }
    } catch (err) {
      addTestResult(`❌ RLS test error: ${err}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testProfileId) {
      toast.error('Vui lòng nhập Profile ID');
      return;
    }
    if (!formData.name || !formData.phone || !formData.message) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    addTestResult('Testing useComments hook...');
    const result = await addComment(formData);
    if (result.success) {
      addTestResult(`✅ useComments hook successful!`);
      toast.success('Đã thêm comment thành công!');
      setFormData({ name: '', phone: '', message: '' });
    } else {
      addTestResult(`❌ useComments hook failed: ${result.error}`);
      toast.error(`Lỗi: ${result.error}`);
    }
  };

  const clearResults = () => setTestResults([]);

  return (
    <div className="p-6 bg-white rounded-lg border space-y-4">
      <h3 className="text-lg font-semibold">Test Comments System & Debug</h3>
      
      {/* Test Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={testDatabaseConnection}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Test DB Connection
        </button>
        <button
          onClick={testRLSPolicies}
          className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
        >
          Test RLS Policies
        </button>
        <button
          onClick={testDirectInsert}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
        >
          Test Direct Insert
        </button>
        <button
          onClick={clearResults}
          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-gray-100 p-3 rounded max-h-40 overflow-y-auto">
          <h4 className="font-medium mb-2">Test Results:</h4>
          {testResults.map((result, index) => (
            <div key={index} className="text-sm font-mono mb-1">
              {result}
            </div>
          ))}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-1">Profile ID:</label>
        <input
          type="text"
          value={testProfileId}
          onChange={(e) => setTestProfileId(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Nhập profile ID để test"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Tên:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="Họ và tên"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Số điện thoại:</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="Số điện thoại"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Lời nhắn:</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            className="w-full p-2 border rounded"
            rows={3}
            placeholder="Lời chia buồn..."
          />
        </div>
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test useComments Hook
        </button>
      </form>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">Comments ({comments.length})</h4>
          <button
            onClick={refetch}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Refresh
          </button>
        </div>
        
        {loading ? (
          <p className="text-gray-500">Đang tải...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500">Chưa có comment nào</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="p-3 bg-gray-50 rounded border">
                <div className="flex justify-between items-start mb-1">
                  <strong className="text-sm">{comment.author_name}</strong>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at || '').toLocaleString('vi-VN')}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
                <div className="text-xs text-gray-500 mt-1">
                  ID: {comment.id.slice(0, 8)}... | 
                  Email: {comment.author_email} | 
                  Approved: {comment.is_approved ? 'Yes' : 'No'} | 
                  Public: {comment.is_public ? 'Yes' : 'No'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};