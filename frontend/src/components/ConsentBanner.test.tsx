import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConsentBanner from './ConsentBanner';

describe('ConsentBanner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('não deve renderizar quando não há consentimento salvo', () => {
    render(<ConsentBanner />);
    // Banner só aparece se usuário recusou antes
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('deve renderizar banner quando consentimento foi recusado', () => {
    const consentData = {
      accepted: false,
      date: new Date().toISOString(),
      version: '1.0',
    };
    localStorage.setItem('bartab_lgpd_consent', JSON.stringify(consentData));
    
    render(<ConsentBanner />);
    expect(screen.getByText(/privacidade/i)).toBeInTheDocument();
  });

  it('não deve renderizar quando consentimento foi aceito', () => {
    const consentData = {
      accepted: true,
      date: new Date().toISOString(),
      version: '1.0',
    };
    localStorage.setItem('bartab_lgpd_consent', JSON.stringify(consentData));
    
    render(<ConsentBanner />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

