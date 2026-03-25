import React from 'react';
import { 
  createRouter, 
  createRoute, 
  createRootRoute, 
  RouterProvider, 
  Outlet, 
  Link,
  useNavigate,
  useParams
} from '@tanstack/react-router';
import { 
  ChevronLeft, 
  Home as HomeIcon, 
  CheckCircle2, 
  ClipboardCheck,
  Plus
} from 'lucide-react';
import { useStore } from './store';
import { HomePage } from './pages/Home';
import { NewJobPage } from './pages/NewJob';
import { ChecklistPage } from './pages/Checklist';
import { StepPage } from './pages/Step';
import { ReviewPage } from './pages/Review';
import { SignaturePage } from './pages/Signature';
import { SuccessPage } from './pages/Success';
import { JobDetailPage } from './pages/JobDetail';
import { AdditionalPhotosPage } from './pages/AdditionalPhotos';

// Layout Component
const RootLayout = () => {
  const { currentJob, rehydrateImages, resetCurrentJob } = useStore();
  const navigate = useNavigate();

  // Restore images from sessionStorage on every mount/navigation
  React.useEffect(() => {
    rehydrateImages();
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-background max-w-md mx-auto relative border-x border-border shadow-2xl">
      {/* Header */}
      <header className="sticky top-0 z-50 h-16 bg-white border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FMa3gsyXY6uWInyamh8kkdXrrAR62%2FEncoreIcon__83ad00b4.png?alt=media&token=bed174ec-bd77-4e50-9b02-add86137cf41" 
            className="w-8 h-8 object-contain" 
            alt="Encore Logo" 
          />
          <span className="font-bold text-lg tracking-tight">CMCE <span className="text-primary">Install</span></span>
        </div>
        {currentJob && (
          <div className="flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Job</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      {/* Footer Navigation */}
      {currentJob && (
        <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-border p-4 grid grid-cols-4 gap-2 z-40">
          <button
            onClick={() => {
              if (currentJob.isCompleted) resetCurrentJob();
              navigate({ to: '/' });
            }}
            className="flex flex-col items-center gap-1 py-1 text-muted-foreground transition-colors hover:text-primary"
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <Link to="/checklist" className="flex flex-col items-center gap-1 py-1 text-muted-foreground transition-colors hover:text-primary">
            <ClipboardCheck className="w-5 h-5" />
            <span className="text-[10px] font-medium">Steps</span>
          </Link>
          <Link to="/review" className="flex flex-col items-center gap-1 py-1 text-muted-foreground transition-colors hover:text-primary">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px] font-medium">Review</span>
          </Link>
        </footer>
      )}
    </div>
  );
};

// Route Definitions
const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const newJobRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/new',
  component: NewJobPage,
});

const checklistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checklist',
  component: ChecklistPage,
});

const stepRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/step/$id',
  component: StepPage,
});

const reviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/review',
  component: ReviewPage,
});

const signatureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signature',
  component: SignaturePage,
});

const additionalPhotosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/additional-photos',
  component: AdditionalPhotosPage,
});

const successRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/success',
  component: SuccessPage,
});

const jobDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/job/$id',
  component: JobDetailPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  newJobRoute,
  checklistRoute,
  stepRoute,
  additionalPhotosRoute,
  reviewRoute,
  signatureRoute,
  successRoute,
  jobDetailRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
