import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Camera, 
  FileText,
  AlertCircle,
  ArrowLeft,
  ImagePlus
} from 'lucide-react';
import { useStore } from '../store';

export const ChecklistPage = () => {
  const navigate = useNavigate();
  const { currentJob } = useStore();

  if (!currentJob) {
    navigate({ to: '/' });
    return null;
  }

  const completedCount = currentJob.steps.filter(s => s.completed).length;
  const totalCount = currentJob.steps.length + 1; // Photos + Signature

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Header */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate({ to: '/new' })} 
            className="p-2 hover:bg-muted rounded-full transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1 flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Installation <span className="text-primary font-black">Steps</span></h1>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {completedCount}/{totalCount} Complete
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-2">
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-700 ease-out" 
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </section>

      {/* Checklist Section */}
      <section className="space-y-3">
        {currentJob.steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => navigate({ to: `/step/${step.id}` })}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all active:scale-[0.98] ${
              step.completed 
                ? 'bg-success/5 border-success/20' 
                : 'bg-white border-border'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              step.completed ? 'bg-success text-white' : 'bg-muted text-muted-foreground'
            }`}>
              {step.completed ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <span className="font-bold text-sm">{index + 1}</span>
              )}
            </div>

            <div className="flex-1 text-left space-y-0.5">
              <h3 className="font-bold text-sm text-slate-900">{step.title}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                {step.completed ? (
                  <span className="text-success uppercase tracking-wider text-[9px] font-bold">Documented</span>
                ) : (
                  <>
                    <Camera className="w-3 h-3" />
                    PHOTO REQUIRED
                  </>
                )}
              </p>
            </div>

            <ChevronRight className={`w-5 h-5 ${step.completed ? 'text-success/50' : 'text-muted-foreground'}`} />
          </button>
        ))}

        {/* Optional: Additional Photos */}
        <button
          onClick={() => navigate({ to: '/additional-photos' })}
          className="w-full flex items-center gap-4 p-4 rounded-xl border transition-all active:scale-[0.98] bg-white border-border"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/10 text-primary">
            <ImagePlus className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left space-y-0.5">
            <h3 className="font-bold text-sm text-slate-900">Additional Photos</h3>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <span className="text-[9px] uppercase tracking-wider font-bold bg-muted px-1.5 py-0.5 rounded">OPTIONAL</span>
              Extra angles, obstacles, site conditions
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Final Step: Signature */}
        <button
          disabled={completedCount < currentJob.steps.length}
          onClick={() => navigate({ to: '/signature' })}
          className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all active:scale-[0.98] ${
            currentJob.isCompleted
              ? 'bg-success/5 border-success/20' 
              : completedCount < currentJob.steps.length
                ? 'bg-muted/30 border-dashed border-border opacity-60'
                : 'bg-white border-primary/20 ring-1 ring-primary/5 shadow-sm'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            currentJob.isCompleted ? 'bg-success text-white' : 'bg-muted text-muted-foreground'
          }`}>
             {currentJob.isCompleted ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
          </div>

          <div className="flex-1 text-left space-y-0.5">
            <h3 className="font-bold text-sm text-slate-900">Completion Form</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
              {currentJob.isCompleted ? (
                 <span className="text-success uppercase tracking-wider text-[9px] font-bold">Signed</span>
              ) : (
                 <>
                  {completedCount < currentJob.steps.length ? (
                    <span className="flex items-center gap-1.5 text-warning italic font-normal">
                       <AlertCircle className="w-3 h-3" />
                       Finish all photos first
                    </span>
                  ) : (
                    <span className="text-primary font-bold uppercase tracking-wider text-[9px]">Awaiting Signature</span>
                  )}
                 </>
              )}
            </p>
          </div>

          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </section>

      {/* Help Section */}
      <section className="bg-slate-900 p-6 rounded-2xl space-y-3">
        <h4 className="text-white font-bold text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-primary" />
          Documentation Tips
        </h4>
        <ul className="space-y-2">
          <li className="text-slate-400 text-xs leading-relaxed">
            • Ensure photos are well-lit and not blurry.
          </li>
          <li className="text-slate-400 text-xs leading-relaxed">
            • Zoom in on serial numbers for readability.
          </li>
          <li className="text-slate-400 text-xs leading-relaxed">
            • Noloax application must be clearly visible.
          </li>
        </ul>
      </section>
    </div>
  );
};