import React from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Calendar,
  User,
  Settings,
  Hash,
  Activity,
  Zap,
  Cable,
  ClipboardCheck,
  Camera,
} from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';

export const JobDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams({ from: '/job/$id' });
  const { history } = useStore();

  const job = history.find((j) => j.id === id);

  if (!job) {
    return (
      <div className="p-4 space-y-6 animate-fade-in text-center pt-20">
        <p className="text-muted-foreground font-medium">Job not found.</p>
        <button onClick={() => navigate({ to: '/' })} className="btn-primary">
          Back to Home
        </button>
      </div>
    );
  }

  const infoRows = [
    { icon: User, label: 'Installer', value: job.installerName },
    { icon: MapPin, label: 'Site Address', value: job.siteAddress },
    { icon: Calendar, label: 'Date', value: format(new Date(job.installDate), 'PPP') },
    { icon: Settings, label: 'CMCE Model', value: job.cmceModel },
    { icon: Hash, label: 'Serial Number', value: job.cmceSerialNumber },
    ...(job.primaryDownConductorSize
      ? [{ icon: Cable, label: 'Primary Down Conductor Size', value: job.primaryDownConductorSize }]
      : []),
    { icon: Activity, label: 'OHM Reading', value: job.ohmReading || 'N/A' },
    { icon: Zap, label: 'Milliamp Reading', value: job.milliampReading || 'N/A' },
  ];

  return (
    <div className="p-4 space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <section className="flex items-center justify-between">
        <button
          onClick={() => navigate({ to: '/' })}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex-1 text-center">
          Installation Details
        </h1>
        <div className="w-9" />
      </section>

      {/* Status Banner */}
      <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
        <div>
          <h2 className="font-bold text-sm text-slate-900">{job.customerName}</h2>
          <p className="text-xs text-muted-foreground">
            Completed {format(new Date(job.createdAt), 'MMM d, yyyy · h:mm a')}
          </p>
        </div>
      </div>

      {/* Job Info */}
      <section className="card-rugged bg-white p-5 space-y-4 shadow-md">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Job Information
        </h3>
        <div className="space-y-3">
          {infoRows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {label}
                </p>
                <p className="text-sm font-semibold text-slate-900 break-words">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Steps Completed */}
      <section className="card-rugged bg-white p-5 space-y-4 shadow-md">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <ClipboardCheck className="w-3 h-3" />
          Documentation Steps
        </h3>
        <div className="space-y-2">
          {job.steps.map((step, i) => (
            <div
              key={step.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-muted/40"
            >
              <div className="w-6 h-6 bg-success/20 text-success rounded-md flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {i + 1}. {step.title}
                </p>
                {step.notes && (
                  <p className="text-[10px] text-muted-foreground truncate">{step.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Photos Summary */}
      {(job.additionalPhotos?.length ?? 0) > 0 && (
        <section className="card-rugged bg-white p-5 space-y-4 shadow-md">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Camera className="w-3 h-3" />
            Additional Photos
          </h3>
          <div className="space-y-2">
            {job.additionalPhotos.map((photo, i) => (
              <div key={photo.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
                <div className="w-6 h-6 bg-primary/20 text-primary rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  {i + 1}
                </div>
                <p className="text-xs font-medium text-slate-700 truncate">
                  {photo.caption || 'No caption'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certification */}
      <section className="card-rugged bg-white p-5 space-y-3 shadow-md">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Certification
        </h3>
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${job.isCertified ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-slate-900">
            {job.isCertified
              ? 'Installer certified this installation meets Encore standards.'
              : 'No certification recorded.'}
          </p>
        </div>
      </section>
    </div>
  );
};
