import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import { Button } from './button';
import { Progress } from './progress';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  className,
  aspectRatio = 'square',
  placeholder = 'Click or drag to upload',
}: ImageUploadProps) {
  const { upload, isUploading, progress } = useCloudinaryUpload({
    onSuccess: (result) => onChange(result.secure_url),
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      await upload(file);
    }
  }, [upload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] },
    maxFiles: 1,
    disabled: isUploading,
  });

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
  };

  if (value) {
    return (
      <div className={cn('relative group', aspectClasses[aspectRatio], className)}>
        <img
          src={value}
          alt="Uploaded"
          className="w-full h-full object-cover rounded-lg"
        />
        {onRemove && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative border-2 border-dashed rounded-lg cursor-pointer transition-colors',
        'hover:border-primary hover:bg-primary/5',
        isDragActive && 'border-primary bg-primary/10',
        isUploading && 'pointer-events-none opacity-60',
        aspectClasses[aspectRatio],
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <Progress value={progress} className="w-full max-w-[200px]" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : (
          <>
            {isDragActive ? (
              <Upload className="h-8 w-8 text-primary" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
            <p className="text-sm text-muted-foreground text-center">{placeholder}</p>
          </>
        )}
      </div>
    </div>
  );
}
