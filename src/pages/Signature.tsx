import React, { useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import SignatureCanvas from 'react-signature-canvas';
import { 
  ArrowLeft, 
  Signature as SignatureIcon, 
  Trash2, 
  CheckCircle2, 
  FileText,
  Lock,
  Calendar,
  User,
  Loader2
} from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const SignaturePage = () => {
  const navigate = useNavigate();
  const { currentJob, completeJob } = useStore();
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const [remarks, setRemarks] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isCertified, setIsCertified] = useState(false);

  if (!currentJob) {
    navigate({ to: '/' });
    return null;
  }

  const clearSignature = () => {
    sigCanvasRef.current?.clear();
  };

  const handleFinalize = () => {
    if (!isCertified) {
       toast.error('Please certify the installation before submitting.');
       return;
    }

    if (sigCanvasRef.current?.isEmpty()) {
       toast.error('Signature is required for completion.');
       return;
    }

    const signature = sigCanvasRef.current?.getTrimmedCanvas().toDataURL('image/png');
    if (signature) {
       setIsFinalizing(true);
       try {
          completeJob(signature, isCertified);
          toast.success('Installation record finalized!');
          navigate({ to: '/success' });
       } catch (error: any) {
          console.error('Finalization failed:', error);
          toast.error('Something went wrong. Please try again.');
       } finally {
          setIsFinalizing(false);
       }
    }
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in pb-24">
      {/* Header */}
      <section className="flex items-center justify-between">
        <button 
          onClick={() => navigate({ to: '/review' })} 
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex-1 text-center">Final Completion Form</h1>
        <div className="w-9" />
      </section>

      {/* Confirmation Card */}
      <section className="card-rugged p-6 border-l-4 border-l-primary space-y-4">
        <div className="bg-primary/5 p-4 rounded-xl flex items-start gap-3">
           <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
           <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-800">Final Declaration</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                I hereby certify that this CMCE installation has been performed and documented according to standard procedures. 
                All required photo evidence has been captured and validated for site: <span className="text-primary font-bold uppercase">{currentJob.customerName}</span>.
              </p>
           </div>
        </div>

        <div className="space-y-3 pt-2">
           <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
              <User className="w-4 h-4 text-primary" />
              <span>{currentJob.installerName}</span>
           </div>
           <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{format(new Date(), 'MMMM d, yyyy')}</span>
           </div>
        </div>
      </section>

      {/* Signature Area */}
      <section className="space-y-3">
         <div className="flex justify-between items-end px-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Installer Signature</h3>
            <button 
              onClick={clearSignature}
              className="text-[10px] font-bold text-destructive uppercase tracking-widest flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
         </div>

         <div className="signature-pad bg-white border-2 border-slate-200 relative">
            <SignatureCanvas 
               ref={sigCanvasRef}
               penColor="black"
               canvasProps={{ className: 'w-full h-48 block cursor-crosshair' }}
               onBegin={() => setIsSigning(true)}
            />
            {!isSigning && (
               <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-40">
                  <SignatureIcon className="w-12 h-12 text-muted-foreground mb-2" />
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sign with finger here</span>
               </div>
            )}
         </div>
      </section>

      {/* Final Remarks */}
      <section className="space-y-3">
         <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Final Remarks / Observations</h3>
         <textarea 
           placeholder="Any final notes or observations about the site..."
           value={remarks}
           onChange={(e) => setRemarks(e.target.value)}
           className="input-field min-h-[100px] py-4 text-sm"
         />
      </section>

      {/* Certification Checkbox */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:border-primary/30">
        <label className="flex items-start gap-4 cursor-pointer group">
          <div className="relative flex items-center mt-0.5">
            <input 
              type="checkbox" 
              checked={isCertified}
              onChange={(e) => setIsCertified(e.target.checked)}
              className="peer h-6 w-6 appearance-none rounded-md border-2 border-slate-300 bg-white transition-all checked:border-primary checked:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            />
            <CheckCircle2 className="absolute h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100 left-1 pointer-events-none" />
          </div>
          <span className="text-sm font-bold text-slate-700 leading-snug select-none group-hover:text-slate-900 transition-colors">
            I certify that this CMCE installation was completed in accordance with Encore Land & Sea installation standards.
          </span>
        </label>
      </section>

      {/* Security Info */}
      <section className="flex items-center justify-center gap-2 py-4">
         <Lock className="w-4 h-4 text-success" />
         <p className="text-[10px] font-bold text-success uppercase tracking-widest">Secure Field-Validated Submission</p>
      </section>

      {/* Finalize Button */}
      <div className="pt-4 pb-8">
        <button 
          onClick={handleFinalize}
          disabled={isFinalizing || !isCertified}
          className="btn-primary w-full shadow-lg shadow-primary/20 h-16 text-lg disabled:opacity-50 disabled:active:scale-100"
        >
          {isFinalizing ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Finalizing...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-6 h-6" />
              Finalize Installation Record
            </>
          )}
        </button>
      </div>
    </div>
  );
};
