import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { 
  Plus, 
  ArrowRight, 
  Clock, 
  Construction
} from 'lucide-react';
import { useStore } from '../store';

export const HomePage = () => {
  const navigate = useNavigate();
  const { currentJob } = useStore();

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <section className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Installation <span className="text-primary font-black">Documentation</span></h1>
        <p className="text-muted-foreground">Standardized photo proof for CMCE installers.</p>
      </section>

      {/* Active Job Card */}
      {currentJob ? (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current Installation</h2>
          <div className="card-rugged p-6 border-l-4 border-l-primary space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{currentJob.customerName || 'Draft Installation'}</h3>
                <p className="text-sm text-muted-foreground">{currentJob.siteAddress || 'No address set'}</p>
              </div>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                DRAFT
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round((currentJob.steps.filter(s => s.completed).length / currentJob.steps.length) * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: `${(currentJob.steps.filter(s => s.completed).length / currentJob.steps.length) * 100}%` }}
                />
              </div>
            </div>

            <button 
              onClick={() => navigate({ to: '/checklist' })}
              className="btn-primary w-full"
            >
              Resume Installation
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="bg-muted/50 rounded-2xl p-8 border border-dashed border-border flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center p-2">
               <img 
                 src="https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FMa3gsyXY6uWInyamh8kkdXrrAR62%2FEncoreIcon__83ad00b4.png?alt=media&token=bed174ec-bd77-4e50-9b02-add86137cf41" 
                 className="w-full h-full object-contain" 
                 alt="Encore Logo" 
               />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-lg">No Active Job</h3>
              <p className="text-sm text-muted-foreground max-w-[240px]">Ready to document a new CMCE installation?</p>
            </div>
            <button 
              onClick={() => navigate({ to: '/new' })}
              className="btn-primary w-full shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5" />
              Start New Installation
            </button>
          </div>
        </section>
      )}


    </div>
  );
};
