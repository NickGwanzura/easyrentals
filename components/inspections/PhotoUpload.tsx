'use client';

import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { PhotoType } from '@/types/inspections';

interface PhotoUploadProps {
  inspectionId: string;
  categoryId?: string;
  onUploadComplete?: (photos: UploadedPhoto[]) => void;
}

export interface UploadedPhoto {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  caption?: string;
  photoType: PhotoType;
}

const photoTypeLabels: Record<PhotoType, string> = {
  before: 'Before',
  during: 'During',
  after: 'After',
  issue: 'Issue',
  general: 'General'
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function PhotoUpload({ 
  inspectionId, 
  categoryId,
  onUploadComplete 
}: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    for (const file of imageFiles) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      const newPhoto: UploadedPhoto = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fileName: file.name,
        fileUrl: previewUrl,
        fileSize: file.size,
        photoType: 'general'
      };
      
      setPhotos(prev => [...prev, newPhoto]);
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === photoId);
      if (photo) {
        URL.revokeObjectURL(photo.fileUrl);
      }
      return prev.filter(p => p.id !== photoId);
    });
  };

  const handlePhotoTypeChange = (photoId: string, photoType: PhotoType) => {
    setPhotos(prev => prev.map(p => 
      p.id === photoId ? { ...p, photoType } : p
    ));
  };

  const handleCaptionChange = (photoId: string, caption: string) => {
    setPhotos(prev => prev.map(p => 
      p.id === photoId ? { ...p, caption } : p
    ));
  };

  const handleUpload = async () => {
    setIsUploading(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would upload to Supabase Storage
    // const uploadedPhotos = await uploadPhotosToSupabase(photos);
    
    setIsUploading(false);
    onUploadComplete?.(photos);
    
    // Clear photos after upload
    setPhotos([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-col items-center">
          <div className="p-4 bg-primary-100 rounded-full mb-4">
            <Camera className="w-8 h-8 text-primary-600" />
          </div>
          <p className="font-medium text-slate-900">
            Drop photos here or click to upload
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Supports JPG, PNG, GIF up to 10MB
          </p>
        </div>
      </div>

      {/* Photo Preview List */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-slate-900">Photos to Upload ({photos.length})</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div 
                key={photo.id}
                className="relative group rounded-lg overflow-hidden border border-slate-200"
              >
                {/* Image Preview */}
                <div className="aspect-square bg-slate-100">
                  <img
                    src={photo.fileUrl}
                    alt={photo.fileName}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Photo Details */}
                <div className="p-2 bg-white">
                  <select
                    value={photo.photoType}
                    onChange={(e) => handlePhotoTypeChange(photo.id, e.target.value as PhotoType)}
                    className="w-full text-xs border border-slate-200 rounded px-2 py-1 mb-1"
                  >
                    {Object.entries(photoTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Add caption..."
                    value={photo.caption || ''}
                    onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded px-2 py-1"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    {formatFileSize(photo.fileSize)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Upload Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              isLoading={isUploading}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Upload {photos.length} Photo{photos.length > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p>No photos added yet</p>
        </div>
      )}
    </div>
  );
}

// Photo Gallery Component for viewing uploaded photos
interface PhotoGalleryProps {
  photos: UploadedPhoto[];
  onDelete?: (photoId: string) => void;
}

export function PhotoGallery({ photos, onDelete }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<UploadedPhoto | null>(null);

  if (photos.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <p>No photos uploaded yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={photo.fileUrl}
              alt={photo.fileName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors">
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <span className="text-xs text-white font-medium">
                  {photoTypeLabels[photo.photoType]}
                </span>
              </div>
            </div>
            {photo.photoType === 'issue' && (
              <div className="absolute top-2 right-2">
                <span className="p-1 bg-red-500 rounded-full">
                  <AlertCircle className="w-3 h-3 text-white" />
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPhoto.fileUrl}
              alt={selectedPhoto.fileName}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
            <div className="mt-4 flex items-center justify-between text-white">
              <div>
                <p className="font-medium">{selectedPhoto.fileName}</p>
                {selectedPhoto.caption && (
                  <p className="text-sm text-white/70">{selectedPhoto.caption}</p>
                )}
                <p className="text-sm text-white/50">
                  {photoTypeLabels[selectedPhoto.photoType]} • {formatFileSize(selectedPhoto.fileSize)}
                </p>
              </div>
              {onDelete && (
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/20"
                  onClick={() => {
                    onDelete(selectedPhoto.id);
                    setSelectedPhoto(null);
                  }}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
