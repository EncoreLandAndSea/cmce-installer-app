import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ChevronRight, 
  FileText,
  Camera,
  Signature,
  ImagePlus
} from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';

export const ReviewPage = () => {
  const navigate = useNavigate();
  const { currentJob } = useStore();

  if (!currentJob) {
    navigate({ to: '/' });
    return null;
  }

  const completedSteps = currentJob.steps.filter(s => s.completed);
  const totalSteps = currentJob.steps.length;
  const hasReadings = !!currentJob.ohmReading && !!currentJob.milliampReading;
  const isReadyForSignature = completedSteps.length === totalSteps && hasReadings;

  return (
    <div className="p-4 space-y-8 animate-fade-in pb-24">
      {/* Header */}
      <section className="flex items-center justify-between">
        <button 
          onClick={() => navigate({ to: '/checklist' })} 
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex-1 text-center">Review Evidence</h1>
        <div className="w-9" />
      </section>

      {/* Job Info Summary */}
      <section className="card-rugged p-6 bg-slate-900 text-white space-y-4 shadow-xl">
        <div className="flex justify-between items-start">
           <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight">{currentJob.customerName}</h2>
              <p className="text-slate-400 text-sm font-medium">{currentJob.siteAddress}</p>
           </div>
           <div className="bg-primary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
              {currentJob.cmceModel}
           </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
           <div className="space-y-0.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Installer</span>
              <p className="text-xs font-semibold">{currentJob.installerName}</p>
           </div>
           <div className="space-y-0.5">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Install Date</span>
              <p className="text-xs font-semibold">{format(new Date(currentJob.installDate), 'MMM d, yyyy')}</p>
           </div>
        </div>
      </section>

      {/* Completion Status */}
      {completedSteps.length < totalSteps && (
        <section className="bg-warning/10 border border-warning/20 p-5 rounded-2xl flex gap-4 items-center animate-pulse">
           <AlertCircle className="w-8 h-8 text-warning shrink-0" />
           <div className="space-y-1">
              <h4 className="text-warning font-bold text-sm">Documentation Incomplete</h4>
              <p className="text-xs text-warning-foreground font-medium">Please complete all {totalSteps} photo steps before signing.</p>
           </div>
        </section>
      )}
      {!hasReadings && (
        <section className="bg-warning/10 border border-warning/20 p-5 rounded-2xl flex gap-4 items-center">
           <AlertCircle className="w-8 h-8 text-warning shrink-0" />
           <div className="space-y-1">
              <h4 className="text-warning font-bold text-sm">Readings Required</h4>
              <p className="text-xs text-warning-foreground font-medium">OHM and Milliamp readings must be entered on the Installation Info page before signing.</p>
           </div>
        </section>
      )}

      {/* Photo Summary Grid */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Photo Evidence Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          {currentJob.steps.map((step) => (
            <button
              key={step.id}
              onClick={() => navigate({ to: `/step/${step.id}` })}
              className="relative aspect-square bg-white border border-border rounded-2xl overflow-hidden group active:scale-95 transition-transform"
            >
              {step.image ? (
                <>
                  <img 
                    src={step.image} 
                    alt={step.title} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm border border-border">
                    <p className="text-[8px] font-bold text-slate-800 truncate uppercase tracking-tighter">{step.title}</p>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-2 bg-muted/30 border-dashed">
                  <Camera className="w-6 h-6 text-muted-foreground" />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">MISSING</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Additional Photos Summary */}
      {(() => {
        const addPhotos = (currentJob.additionalPhotos ?? []).filter(p => p.image);
        if (addPhotos.length === 0) {
          return (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Additional Photos</h3>
                <button
                  onClick={() => navigate({ to: '/additional-photos' })}
                  className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline"
                >
                  + Add
                </button>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-dashed border-border bg-muted/20">
                <ImagePlus className="w-5 h-5 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground font-medium">No additional photos added. <span className="text-primary font-bold">Optional.</span></p>
              </div>
            </section>
          );
        }
        return (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Additional Photos ({addPhotos.length})</h3>
              <button
                onClick={() => navigate({ to: '/additional-photos' })}
                className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {addPhotos.map((photo, i) => (
                <button
                  key={photo.id}
                  onClick={() => navigate({ to: '/additional-photos' })}
                  className="relative aspect-square bg-white border border-border rounded-2xl overflow-hidden group active:scale-95 transition-transform"
                >
                  <img
                    src={photo.image!}
                    alt={photo.caption || `Additional photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm border border-border">
                    <p className="text-[8px] font-bold text-slate-800 truncate uppercase tracking-tighter">
                      {photo.caption?.trim() || `Photo ${i + 1}`}
                    </p>
                  </div>
                  <div className="absolute top-2 left-2 bg-primary/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Extra
                  </div>
                </button>
              ))}
            </div>
          </section>
        );
      })()}

      {/* Action Button */}
      <div className="pt-4 pb-8">
        <button 
          disabled={!isReadyForSignature}
          onClick={() => navigate({ to: '/signature' })}
          className="btn-primary w-full shadow-lg shadow-primary/20 h-16 text-lg"
        >
          <Signature className="w-6 h-6" />
          Continue to Signature
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
