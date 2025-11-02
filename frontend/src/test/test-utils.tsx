import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Mock do AuthContext para testes
interface MockAuthContextProps {
  user?: any;
  login?: () => Promise<void>;
  logout?: () => void;
  loading?: boolean;
}

const AllTheProviders = ({ children, authValue }: { children: React.ReactNode; authValue?: MockAuthContextProps }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authValue?: MockAuthContextProps;
}

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions,
) => {
  const { authValue, ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders authValue={authValue}>{children}</AllTheProviders>
    ),
    ...renderOptions,
  });
};

export * from '@testing-library/react';
export { customRender as render };

