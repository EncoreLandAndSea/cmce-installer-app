import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { 
  ArrowLeft, 
  Camera, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  Image as ImageIcon,
  AlertCircle,
  FileText,
  RotateCw
} from 'lucide-react';
import { useStore } from '../store';
import { compressImage, rotateImage90 } from '../lib/imageStore';

export const StepPage = () => {
  const navigate = useNavigate();
  const { id } = useParams({ from: '/step/$id' });
  const { currentJob, updateStep } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  if (!currentJob) {
    navigate({ to: '/' });
    return null;
  }

  const stepIndex = currentJob.steps.findIndex(s => s.id === id);
  const step = currentJob.steps[stepIndex];
  const nextStep = currentJob.steps[stepIndex + 1];
  const prevStep = currentJob.steps[stepIndex - 1];

  if (!step) {
    navigate({ to: '/checklist' });
    return null;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be re-selected after a retake
    e.target.value = '';

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const raw = event.target?.result as string;
          // Compress to ≤1024px JPEG before storing — prevents quota errors
          const compressed = await compressImage(raw);
          updateStep(step.id, { image: compressed, completed: true });
        } catch (err) {
          console.error('Image compression failed:', err);
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = () => setIsUploading(false);
      reader.readAsDataURL(file);
    } catch (err) {
      setIsUploading(false);
    }
  };

  const handleRotate = async () => {
    if (!step.image || isRotating) return;
    setIsRotating(true);
    try {
      const rotated = await rotateImage90(step.image);
      updateStep(step.id, { image: rotated });
    } catch (err) {
      console.error('Rotation failed:', err);
    } finally {
      setIsRotating(false);
    }
  };

  const removePhoto = () => {
    updateStep(step.id, { 
      image: undefined, 
      completed: false 
    });
  };

  const goToNext = () => {
    if (nextStep) {
      navigate({ to: `/step/${nextStep.id}` });
    } else {
      navigate({ to: '/checklist' });
    }
  };

  const goToPrev = () => {
    if (prevStep) {
      navigate({ to: `/step/${prevStep.id}` });
    } else {
      navigate({ to: '/checklist' });
    }
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in pb-24">
      {/* Header */}
      <section className="flex items-center justify-between">
        <button 
          onClick={() => navigate({ to: '/checklist' })} 
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Documentation {stepIndex + 1}/{currentJob.steps.length}</p>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 truncate px-4">{step.title}</h1>
        </div>
        <div className="w-9" />
      </section>

      {/* Prompt Card */}
      <section className="card-rugged p-6 space-y-4">
        <div className="bg-primary/5 text-primary p-4 rounded-xl flex items-start gap-3 border border-primary/10">
           <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
           <p className="text-sm font-medium leading-relaxed italic">{step.prompt}</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">What must be visible:</h3>
          <ul className="space-y-2">
            {step.checklist.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Photo Capture Area */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Photo Evidence</h3>
        
        {step.image ? (
          <div className="space-y-3 animate-fade-in">
            <div className="relative group">
               <img 
                 src={step.image} 
                 alt={step.title} 
                 className="w-full rounded-2xl shadow-lg border-2 border-primary/20 object-contain bg-slate-100"
               />
               <div className="absolute top-3 right-3 flex gap-2">
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-primary active:scale-90 transition-transform"
                 >
                   <Camera className="w-5 h-5" />
                 </button>
                 <button 
                   onClick={removePhoto}
                   className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-destructive active:scale-90 transition-transform"
                 >
                   <Trash2 className="w-5 h-5" />
                 </button>
               </div>
               <div className="absolute bottom-3 left-3 bg-success/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5">
                 <CheckCircle2 className="w-3 h-3" />
                 ACCEPTED
               </div>
            </div>
            {/* Rotate Button */}
            <button
              onClick={handleRotate}
              disabled={isRotating}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-white text-sm font-bold text-slate-700 active:scale-95 transition-transform hover:bg-muted disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 text-primary ${isRotating ? 'animate-spin' : ''}`} />
              {isRotating ? 'Rotating...' : 'Rotate Image 90°'}
            </button>
          </div>
        ) : (
          <button 
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[4/3] bg-muted border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center space-y-3 active:bg-muted/50 transition-colors"
          >
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-muted-foreground">
               <Camera className="w-8 h-8" />
            </div>
            <div className="text-center space-y-1">
              <span className="text-sm font-bold text-slate-700">{isUploading ? 'Capturing...' : 'Tap to Capture Photo'}</span>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Rear camera recommended</p>
            </div>
          </button>
        )}

        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          className="hidden" 
        />
      </section>

      {/* Optional Notes */}
      <section className="space-y-3">
         <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Notes (Optional)</h3>
         <div className="relative">
            <textarea 
              placeholder="Add field notes about this specific step..."
              value={step.notes || ''}
              onChange={(e) => updateStep(step.id, { notes: e.target.value })}
              className="w-full p-4 rounded-xl border border-border bg-white min-h-[100px] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <FileText className="absolute bottom-3 right-3 w-4 h-4 text-muted-foreground" />
         </div>
      </section>

      {/* Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-border p-4 grid grid-cols-2 gap-3 z-50">
        <button 
          onClick={goToPrev}
          className="btn-secondary"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>
        <button 
          onClick={goToNext}
          className="btn-primary"
        >
          {nextStep ? 'Next Step' : 'Finish Photos'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
};
