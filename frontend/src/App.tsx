import { RouterProvider } from 'react-router-dom';
import { router } from './app/routes';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from './components/ui/toaster';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster />
      <PWAInstallPrompt />
      <OfflineIndicator />
    </ErrorBoundary>
  );
}

export default App;
