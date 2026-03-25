import React, { useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft,
  Camera,
  Plus,
  Trash2,
  RotateCw,
  ImageIcon,
  CheckCircle2,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { useStore } from '../store';
import { compressImage, rotateImage90 } from '../lib/imageStore';

export const AdditionalPhotosPage = () => {
  const navigate = useNavigate();
  const { currentJob, addAdditionalPhoto, removeAdditionalPhoto, updateAdditionalPhoto } = useStore();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [rotatingId, setRotatingId] = useState<string | null>(null);

  if (!currentJob) {
    navigate({ to: '/' });
    return null;
  }

  const photos = currentJob.additionalPhotos ?? [];

  const handleFileChange = async (photoId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploadingId(photoId);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const raw = event.target?.result as string;
          const compressed = await compressImage(raw);
          updateAdditionalPhoto(photoId, { image: compressed });
        } catch (err) {
          console.error('Compression failed:', err);
        } finally {
          setUploadingId(null);
        }
      };
      reader.onerror = () => setUploadingId(null);
      reader.readAsDataURL(file);
    } catch {
      setUploadingId(null);
    }
  };

  const handleRotate = async (photoId: string, currentImage: string) => {
    if (rotatingId) return;
    setRotatingId(photoId);
    try {
      const rotated = await rotateImage90(currentImage);
      updateAdditionalPhoto(photoId, { image: rotated });
    } catch (err) {
      console.error('Rotation failed:', err);
    } finally {
      setRotatingId(null);
    }
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in pb-32">
      {/* Header */}
      <section className="flex items-center justify-between">
        <button
          onClick={() => navigate({ to: '/checklist' })}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Optional</p>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Additional Photos</h1>
        </div>
        <div className="w-9" />
      </section>

      {/* Info banner */}
      <section className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-start gap-3">
        <ImageIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-slate-600 font-medium leading-relaxed">
          Capture any extra photos: different angles, obstacles, site conditions, or anything else worth documenting. Each photo can have its own caption.
        </p>
      </section>

      {/* Photo cards */}
      <section className="space-y-6">
        {photos.map((photo, index) => (
          <div key={photo.id} className="card-rugged p-4 space-y-3 border border-border">
            {/* Card header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Photo {index + 1}
              </span>
              {photos.length > 1 && (
                <button
                  onClick={() => removeAdditionalPhoto(photo.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-destructive hover:bg-destructive/10 active:scale-90 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Photo area */}
            {photo.image ? (
              <div className="space-y-2">
                <div className="relative group">
                  <img
                    src={photo.image}
                    alt={`Additional photo ${index + 1}`}
                    className="w-full rounded-xl shadow border border-primary/10 object-contain bg-slate-100"
                  />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button
                      onClick={() => fileInputRefs.current[photo.id]?.click()}
                      className="w-9 h-9 bg-white rounded-lg shadow flex items-center justify-center text-primary active:scale-90 transition-transform"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateAdditionalPhoto(photo.id, { image: undefined })}
                      className="w-9 h-9 bg-white rounded-lg shadow flex items-center justify-center text-destructive active:scale-90 transition-transform"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-success/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    CAPTURED
                  </div>
                </div>

                {/* Rotate button */}
                <button
                  onClick={() => handleRotate(photo.id, photo.image!)}
                  disabled={rotatingId === photo.id}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-border bg-white text-sm font-bold text-slate-700 active:scale-95 transition-transform hover:bg-muted disabled:opacity-50"
                >
                  <RotateCw className={`w-4 h-4 text-primary ${rotatingId === photo.id ? 'animate-spin' : ''}`} />
                  {rotatingId === photo.id ? 'Rotating...' : 'Rotate Image 90°'}
                </button>
              </div>
            ) : (
              <button
                disabled={uploadingId === photo.id}
                onClick={() => fileInputRefs.current[photo.id]?.click()}
                className="w-full aspect-video bg-muted border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 active:bg-muted/50 transition-colors"
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-muted-foreground">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-600">
                  {uploadingId === photo.id ? 'Capturing...' : 'Tap to Add Photo'}
                </span>
              </button>
            )}

            <input
  ref={(el) => { fileInputRefs.current[photo.id] = el; }}
  type="file"
  accept="image/*"
  onChange={(e) => handleFileChange(photo.id, e)}
  className="hidden"
/>

            {/* Caption input */}
            <div className="relative">
              <textarea
                placeholder="Add a caption for this photo (optional)..."
                value={photo.caption}
                onChange={(e) => updateAdditionalPhoto(photo.id, { caption: e.target.value })}
                rows={2}
                className="w-full p-3 pr-8 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <FileText className="absolute bottom-3 right-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        ))}
      </section>

      {/* Add another photo button */}
      <button
        onClick={addAdditionalPhoto}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-bold text-sm hover:bg-primary/5 active:scale-95 transition-all"
      >
        <Plus className="w-5 h-5" />
        Add Another Photo
      </button>

      {/* Continue button */}
      <div className="pt-2 pb-8">
        <button
          onClick={() => navigate({ to: '/review' })}
          className="btn-primary w-full shadow-lg shadow-primary/20 h-14 text-base"
        >
          <ChevronRight className="w-5 h-5" />
          Continue to Review
        </button>
      </div>
    </div>
  );
};
