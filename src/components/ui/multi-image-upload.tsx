import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import { Button } from './button';

interface ImageItem {
  id?: string;
  url: string;
  caption?: string;
}

interface MultiImageUploadProps {
  value: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  maxImages?: number;
  className?: string;
}

export function MultiImageUpload({
  value = [],
  onChange,
  maxImages = 20,
  className,
}: MultiImageUploadProps) {
  const { uploadMultiple, isUploading } = useCloudinaryUpload();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const remainingSlots = maxImages - value.length;
    const filesToUpload = acceptedFiles.slice(0, remainingSlots);
    
    const results = await uploadMultiple(filesToUpload);
    const newImages = results.map(result => ({ url: result.secure_url }));
    
    onChange([...value, ...newImages]);
  }, [value, onChange, maxImages, uploadMultiple]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] },
    disabled: isUploading || value.length >= maxImages,
  });

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const canAddMore = value.length < maxImages;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {value.map((image, index) => (
          <div key={index} className="relative aspect-square group">
            <img
              src={image.url}
              alt={image.caption || `Image ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeImage(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {canAddMore && (
          <div
            {...getRootProps()}
            className={cn(
              'aspect-square border-2 border-dashed rounded-lg cursor-pointer transition-colors',
              'hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center gap-2',
              isDragActive && 'border-primary bg-primary/10',
              isUploading && 'pointer-events-none opacity-60'
            )}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : isDragActive ? (
              <Upload className="h-6 w-6 text-primary" />
            ) : (
              <Plus className="h-6 w-6 text-muted-foreground" />
            )}
            <p className="text-xs text-muted-foreground">
              {isUploading ? 'Uploading...' : 'Add photos'}
            </p>
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {value.length} / {maxImages} photos
      </p>
    </div>
  );
}
