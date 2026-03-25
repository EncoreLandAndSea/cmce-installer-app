import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { saveImage, loadImage, removeImage, clearAllImages, saveSignature, loadSignature } from './lib/imageStore';

export interface JobStep {
  id: string;
  title: string;
  prompt: string;
  checklist: string[];
  image?: string; // runtime only — NOT persisted to localStorage
  notes?: string;
  completed: boolean;
  type: 'photo' | 'form';
}

export interface AdditionalPhoto {
  id: string;
  caption: string;
  image?: string; // runtime only — stored in sessionStorage
}

export interface JobData {
  id: string;
  installerName: string;
  customerName: string;
  siteAddress: string;
  installDate: string;
  cmceModel: string;
  cmceSerialNumber: string;
  primaryDownConductorSize: string;
  ohmReading: string;
  milliampReading: string;
  notes: string;
  steps: JobStep[];
  additionalPhotos: AdditionalPhoto[];
  signature?: string;
  isCertified?: boolean;
  isCompleted: boolean;
  createdAt: string;
}

const INITIAL_STEPS: JobStep[] = [
  {
    id: 'step-1',
    title: 'CMCE Serial Number',
    prompt: 'Take a clear photo of the CMCE serial number. The serial number may be on the box or etched into the CMCE.',
    checklist: ['Serial number is clearly readable', 'Photo is in focus'],
    completed: false,
    type: 'photo',
  },
  {
    id: 'step-2',
    title: 'Primary Conductor with Noloax',
    prompt: 'Take a photo of the primary conductor with Noloax applied before insertion into the CMCE.',
    checklist: ['Conductor is visible', 'Noloax application is clearly seen'],
    completed: false,
    type: 'photo',
  },
  {
    id: 'step-3',
    title: 'Wide shot of CMCE mounted to structure',
    prompt: 'Take a wide shot showing the CMCE mounted to the structure with the primary wire route clearly visible.',
    checklist: ['Visible mounting point', 'Wire route is clearly documented'],
    completed: false,
    type: 'photo',
  },
  {
    id: 'step-4',
    title: 'Clean Wire Run',
    prompt: 'Take a wide photo of the full wire run. The wire must have no 90-degree bends and must be clamped to the structure throughout.',
    checklist: ['Full wire run is visible', 'No 90-degree bends present', 'Wire is clamped to structure'],
    completed: false,
    type: 'photo',
  },
  {
    id: 'step-5',
    title: 'Mast Ground Clamp',
    prompt: 'Take a photo of the mast ground clamp with the 8 AWG wire and Noloax present.',
    checklist: ['Mast clamp is visible', '8 AWG wire is connected', 'Noloax is applied'],
    completed: false,
    type: 'photo',
  },
  {
    id: 'step-6',
    title: 'Primary Grounding Connection',
    prompt: 'Take a photo of the primary grounding connection.',
    checklist: ['Primary grounding point is clearly visible', 'Connection is secure'],
    completed: false,
    type: 'photo',
  },
  {
    id: 'step-7',
    title: '8 AWG Grounding Connection',
    prompt: 'Take a photo of the 8 AWG grounding connection.',
    checklist: ['Full grounding connection is visible', 'No loose wires'],
    completed: false,
    type: 'photo',
  },
  {
    id: 'step-8',
    title: 'Milliamp Meter Reading',
    prompt: 'Take a photo of the milliamp meter clamped around the primary conductor. The photo must show what it is clamped to and the reading on the meter.',
    checklist: ['Clamp placement is visible', 'Meter reading is clear', 'Reading and clamp in same image'],
    completed: false,
    type: 'photo',
  },
];

interface AppState {
  currentJob: JobData | null;
  history: JobData[];
  startNewJob: (data: Partial<JobData>) => void;
  updateJobData: (data: Partial<JobData>) => void;
  updateStep: (stepId: string, updates: Partial<JobStep>) => void;
  updateAdditionalPhoto: (photoId: string, updates: Partial<AdditionalPhoto>) => void;
  addAdditionalPhoto: () => void;
  removeAdditionalPhoto: (photoId: string) => void;
  completeJob: (signature: string, isCertified: boolean) => void;
  resetCurrentJob: () => void;
  rehydrateImages: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentJob: null,
      history: [],

      startNewJob: (data) => set({
        currentJob: {
          id: Math.random().toString(36).substring(7),
          installerName: '',
          customerName: '',
          siteAddress: '',
          installDate: new Date().toISOString().split('T')[0],
          cmceModel: '',
          cmceSerialNumber: '',
          primaryDownConductorSize: '',
          ohmReading: '',
          milliampReading: '',
          notes: '',
          steps: [...INITIAL_STEPS],
          additionalPhotos: [{ id: 'add-photo-1', caption: '' }],
          isCompleted: false,
          createdAt: new Date().toISOString(),
          ...data,
        },
      }),

      updateJobData: (data) => set((state) => ({
        currentJob: state.currentJob ? { ...state.currentJob, ...data } : null,
      })),

      addAdditionalPhoto: () => set((state) => {
        if (!state.currentJob) return state;
        const newPhoto: AdditionalPhoto = {
          id: `add-photo-${Date.now()}`,
          caption: '',
        };
        return {
          currentJob: {
            ...state.currentJob,
            additionalPhotos: [...(state.currentJob.additionalPhotos ?? []), newPhoto],
          },
        };
      }),

      removeAdditionalPhoto: (photoId) => {
        removeImage(photoId);
        set((state) => ({
          currentJob: state.currentJob ? {
            ...state.currentJob,
            additionalPhotos: (state.currentJob.additionalPhotos ?? []).filter(p => p.id !== photoId),
          } : null,
        }));
      },

      updateAdditionalPhoto: (photoId, updates) => {
        if ('image' in updates) {
          if (updates.image) saveImage(photoId, updates.image);
          else removeImage(photoId);
        }
        set((state) => ({
          currentJob: state.currentJob ? {
            ...state.currentJob,
            additionalPhotos: (state.currentJob.additionalPhotos ?? []).map(p =>
              p.id === photoId ? { ...p, ...updates } : p
            ),
          } : null,
        }));
      },

      updateStep: (stepId, updates) => {
        // Route image in/out of sessionStorage — never localStorage
        if ('image' in updates) {
          if (updates.image) {
            saveImage(stepId, updates.image);
          } else {
            removeImage(stepId);
          }
        }
        // Write all fields to runtime state (including image for immediate UI),
        // but the persist middleware will omit image because we use a custom serializer below.
        set((state) => ({
          currentJob: state.currentJob ? {
            ...state.currentJob,
            steps: state.currentJob.steps.map((s) =>
              s.id === stepId ? { ...s, ...updates } : s
            ),
          } : null,
        }));
      },

      completeJob: (signature, isCertified) => {
        // Store signature in sessionStorage as well to avoid localStorage quota
        const currentJob = get().currentJob;
        if (currentJob) {
          saveSignature(currentJob.id, signature);
        }

        set((state) => {
          if (!state.currentJob) return state;
          const completedJob = {
            ...state.currentJob,
            signature,
            isCertified,
            isCompleted: true,
          };
          return {
            currentJob: completedJob,
            history: [completedJob, ...state.history],
          };
        });
      },

      resetCurrentJob: () => {
        clearAllImages();
        set({ currentJob: null });
      },

      // Call this on app mount to restore images from sessionStorage into runtime state
      rehydrateImages: () => {
        const { currentJob } = get();
        if (!currentJob) return;
        
        const signature = loadSignature(currentJob.id) || currentJob.signature;

        set({
          currentJob: {
            ...currentJob,
            signature,
            steps: currentJob.steps.map((s) => ({
              ...s,
              image: loadImage(s.id) ?? s.image,
            })),
            additionalPhotos: (currentJob.additionalPhotos ?? []).map((p) => ({
              ...p,
              image: loadImage(p.id) ?? p.image,
            })),
          },
        });
      },
    }),
    {
      name: 'cmce-install-storage',
      // Strip all heavy image/signature data before writing to localStorage
      partialize: (state) => ({
        ...state,
        currentJob: state.currentJob ? {
          ...state.currentJob,
          signature: undefined,
          steps: state.currentJob.steps.map(({ image, ...step }) => step),
          additionalPhotos: state.currentJob.additionalPhotos.map(({ image, ...p }) => p),
        } : null,
        history: state.history.map((job) => ({
          ...job,
          signature: undefined,
          steps: job.steps.map(({ image, ...step }) => step),
          additionalPhotos: (job.additionalPhotos ?? []).map(({ image, ...p }) => p),
        })),
      }),
    }
  )
);
