import { useState, useCallback } from 'react';
import { uploadToCloudinary, CloudinaryUploadResult } from '@/lib/cloudinary';
import { toast } from 'sonner';

interface UseCloudinaryUploadOptions {
  onSuccess?: (result: CloudinaryUploadResult) => void;
  onError?: (error: Error) => void;
}

export function useCloudinaryUpload(options?: UseCloudinaryUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(async (file: File): Promise<CloudinaryUploadResult | null> => {
    setIsUploading(true);
    setProgress(0);

    // Simulate progress since Cloudinary doesn't provide upload progress in basic fetch
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const result = await uploadToCloudinary(file);

      setProgress(100);
      
      toast.success('Image uploaded successfully');
      options?.onSuccess?.(result);
      
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Upload failed');
      toast.error(err.message);
      options?.onError?.(err);
      return null;
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
      setTimeout(() => setProgress(0), 500);
    }
  }, [options]);

  const uploadMultiple = useCallback(async (files: File[]): Promise<CloudinaryUploadResult[]> => {
    const results: CloudinaryUploadResult[] = [];
    
    for (const file of files) {
      const result = await upload(file);
      if (result) results.push(result);
    }
    
    return results;
  }, [upload]);

  return {
    upload,
    uploadMultiple,
    isUploading,
    progress,
  };
}
