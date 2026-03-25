import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { 
  CheckCircle2, 
  Home as HomeIcon, 
  Download, 
  Printer, 
  ArrowRight,
  ClipboardCheck,
  Award,
  Loader2
} from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { generateReportPDF } from '../lib/report';

export const SuccessPage = () => {
  const navigate = useNavigate();
  const { currentJob, resetCurrentJob } = useStore();
  const [isDownloading, setIsDownloading] = useState(false);
const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  if (!currentJob || !currentJob.isCompleted) {
    navigate({ to: '/' });
    return null;
  }
useEffect(() => {
  const sendToPowerAutomate = async () => {
    if (!currentJob || !currentJob.isCompleted) return;

    try {
      const blob = await generateReportPDF(currentJob);
      const pdfBase64 = await blobToBase64(blob);

      await fetch('https://defaulte97eb1c2739d4877876c1d0faa65b5.dd.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/c973dacd63cf4c8b9963c23103ae2746/triggers/manual/paths/invoke?api-version=1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: currentJob.customerName,
          siteAddress: currentJob.siteAddress,
          installerName: currentJob.installerName,
          cmceModel: currentJob.cmceModel,
          cmceSerialNumber: currentJob.cmceSerialNumber,
          pdfFileName: `CMCE Report ${currentJob.customerName.replace(/\s+/g, '_')}.pdf`,
          pdfBase64,
        }),
      });
    } catch (error) {
      console.error('Power Automate submission failed:', error);
    }
  };

  sendToPowerAutomate();
}, [currentJob]);
  const handleFinish = () => {
    resetCurrentJob();
    navigate({ to: '/' });
  };

  const handleDownload = async () => {
    if (!currentJob) return;
    setIsDownloading(true);
    try {
      const blob = await generateReportPDF(currentJob);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CMCE_Report_${currentJob.customerName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-4 space-y-8 animate-fade-in pb-24 text-center">
      {/* Success Hero */}
      <section className="pt-12 flex flex-col items-center space-y-6">
        <div className="w-24 h-24 bg-white text-success rounded-full shadow-xl shadow-success/20 flex items-center justify-center animate-bounce border-4 border-success/10">
           <CheckCircle2 className="w-12 h-12" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Installation Complete</h1>
          <p className="text-muted-foreground font-medium">Site: <span className="text-primary font-bold">{currentJob.customerName}</span></p>
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            Export the PDF below and send it to your<br/>
            <span className="text-slate-900 font-bold">office or project file.</span>
          </p>
        </div>

        <div className="bg-muted px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
           <Award className="w-4 h-4 text-primary" />
           Field Validated Record
        </div>
      </section>

      {/* Summary Card */}
      <section className="card-rugged p-6 space-y-4 bg-white shadow-xl border-l-4 border-l-success">
         <div className="flex justify-between items-start text-left">
            <div>
               <h3 className="font-bold text-lg">{currentJob.customerName}</h3>
               <p className="text-xs text-muted-foreground">{currentJob.siteAddress}</p>
            </div>
            <div className="text-right">
               <div className="bg-success/10 text-success px-3 py-1 rounded-full text-[10px] font-bold mb-1">
                  {currentJob.cmceModel}
               </div>
               <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-tight">{currentJob.cmceSerialNumber}</p>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="text-left space-y-1">
               <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Installer</span>
               <p className="text-xs font-bold">{currentJob.installerName}</p>
            </div>
            <div className="text-left space-y-1">
               <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Date</span>
               <p className="text-xs font-bold">{format(new Date(), 'MMM d, yyyy')}</p>
            </div>
         </div>

         <div className="pt-2 text-left space-y-2">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Documentation</span>
            <div className="flex flex-wrap gap-2">
               {currentJob.steps.map((_, i) => (
                  <div key={i} className="w-6 h-6 bg-success/20 text-success rounded-md flex items-center justify-center">
                     <CheckCircle2 className="w-4 h-4" />
                  </div>
               ))}
               <div className="w-6 h-6 bg-success/20 text-success rounded-md flex items-center justify-center">
                  <ClipboardCheck className="w-4 h-4" />
               </div>
            </div>
         </div>

         <div className="pt-4 flex justify-between items-center bg-muted/30 p-4 rounded-xl">
            <span className="text-xs font-bold text-slate-700">Digital Signature</span>
            <img 
               src={currentJob.signature} 
               alt="Installer Signature" 
               className="h-10 object-contain grayscale"
            />
         </div>
      </section>

      {/* Export Actions */}
      <section className="grid grid-cols-2 gap-3">
         <button 
           onClick={handleDownload}
           disabled={isDownloading}
           className="btn-secondary h-16 flex flex-col items-center justify-center gap-1 border-2 disabled:opacity-50"
         >
            {isDownloading ? (
               <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
               <Download className="w-5 h-5 text-primary" />
            )}
            <span className="text-[10px] font-bold uppercase tracking-widest">Export PDF</span>
         </button>
         <button 
           onClick={() => window.print()}
           className="btn-secondary h-16 flex flex-col items-center justify-center gap-1 border-2"
         >
            <Printer className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Print Summary</span>
         </button>
      </section>

      {/* Final Finish Button */}
      <div className="pt-4 pb-8">
        <button 
          onClick={handleFinish}
          className="btn-primary w-full h-16 text-lg"
        >
          <HomeIcon className="w-6 h-6" />
          Return to Dashboard
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
