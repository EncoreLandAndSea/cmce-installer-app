import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { 
  Plus, 
  User, 
  MapPin, 
  Calendar, 
  ChevronRight,
  ArrowLeft,
  Settings,
  Hash,
  Activity,
  Zap,
  Cable
} from 'lucide-react';
import { useStore } from '../store';

export const NewJobPage = () => {
  const navigate = useNavigate();
  const { currentJob, startNewJob, updateJobData } = useStore();
  
  const [formData, setFormData] = useState({
    installerName: currentJob?.installerName || '',
    customerName: currentJob?.customerName || '',
    siteAddress: currentJob?.siteAddress || '',
    installDate: currentJob?.installDate || new Date().toISOString().split('T')[0],
    cmceModel: currentJob?.cmceModel || 'CMCE-120',
    cmceSerialNumber: currentJob?.cmceSerialNumber || '',
    primaryDownConductorSize: currentJob?.primaryDownConductorSize || '',
    ohmReading: currentJob?.ohmReading || '',
    milliampReading: currentJob?.milliampReading || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentJob) {
      updateJobData(formData);
    } else {
      startNewJob(formData);
    }
    navigate({ to: '/checklist' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      {/* Header */}
      <section className="flex items-center justify-between">
        <button 
          onClick={() => navigate({ to: currentJob ? '/checklist' : '/' })} 
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex-1 text-center">
          {currentJob ? 'Edit Installation' : 'New Installation'}
        </h1>
        <div className="w-9" /> {/* Spacer */}
      </section>

      {/* Form Section */}
      <section className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Installer Info */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
              <User className="w-3 h-3" />
              Installer
            </label>
            <input 
              required
              name="installerName"
              placeholder="Your full name"
              value={formData.installerName}
              onChange={handleInputChange}
              className="input-field" 
            />
          </div>

          {/* Customer Info */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
              <Plus className="w-3 h-3" />
              Customer / Site Name
            </label>
            <input 
              required
              name="customerName"
              placeholder="e.g. Acme Solar Site B"
              value={formData.customerName}
              onChange={handleInputChange}
              className="input-field" 
            />
          </div>

          {/* Site Address */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              Site Address
            </label>
            <input 
              required
              name="siteAddress"
              placeholder="Full location address"
              value={formData.siteAddress}
              onChange={handleInputChange}
              className="input-field" 
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              Date
            </label>
            <input 
              required
              type="date"
              name="installDate"
              value={formData.installDate}
              onChange={handleInputChange}
              className="input-field px-4" 
            />
          </div>

          {/* CMCE Model */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
              <Settings className="w-3 h-3" />
              CMCE Model
            </label>
            <select 
              required
              name="cmceModel"
              value={formData.cmceModel}
              onChange={handleInputChange}
              className="input-field px-4"
            >
              <option value="CMCE-120">CMCE-120</option>
              <option value="CMCE-55">CMCE-55</option>
              <option value="CMCE-25">CMCE-25</option>
              <option value="CMCE-120UL">CMCE-120UL</option>
              <option value="CMCE-Gold">CMCE-Gold</option>
              <option value="CMCE-Platinum">CMCE-Platinum</option>
              <option value="CMCE-Diamond">CMCE-Diamond</option>
            </select>
          </div>

          {/* CMCE Serial Number */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
              <Hash className="w-3 h-3" />
              CMCE Serial Number
            </label>
            <input 
              required
              name="cmceSerialNumber"
              placeholder="e.g. CMCE-XX-XXXXXX"
              value={formData.cmceSerialNumber}
              onChange={handleInputChange}
              className="input-field" 
            />
          </div>

          {/* Primary Down Conductor Size */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
              <Cable className="w-3 h-3" />
              Primary Down Conductor Size
            </label>
            <input 
              name="primaryDownConductorSize"
              placeholder="e.g. 2/0 AWG"
              value={formData.primaryDownConductorSize}
              onChange={handleInputChange}
              className="input-field" 
            />
          </div>

          {/* OHM Reading */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
              <Activity className="w-3 h-3" />
              OHM Reading
            </label>
            <input 
              required
              name="ohmReading"
              placeholder="e.g. 0.023"
              value={formData.ohmReading}
              onChange={handleInputChange}
              className="input-field" 
            />
          </div>

          {/* Milliamp Reading */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
              <Zap className="w-3 h-3" />
              Milliamp Reading
            </label>
            <input 
              required
              name="milliampReading"
              placeholder="e.g. 0.2"
              value={formData.milliampReading}
              onChange={handleInputChange}
              className="input-field" 
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="btn-primary w-full shadow-lg shadow-primary/20"
            >
              {currentJob ? 'Update Job Details' : 'Initialize Job Checklist'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};