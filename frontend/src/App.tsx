import { RouterProvider } from 'react-router-dom';
import { router } from './app/routes';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
