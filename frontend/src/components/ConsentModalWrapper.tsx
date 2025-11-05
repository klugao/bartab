import { useLocation } from 'react-router-dom';
import ConsentModal from './ConsentModal';
import ConsentBanner from './ConsentBanner';

/**
 * Wrapper que controla quando o ConsentModal deve aparecer
 * Não mostra o modal nas páginas de documentos legais
 */
export default function ConsentModalWrapper() {
  const location = useLocation();
  
  // Não mostrar modal nas páginas de documentos legais
  const isLegalPage = location.pathname === '/politica-privacidade' || 
                      location.pathname === '/termos-uso';
  
  if (isLegalPage) {
    return <ConsentBanner />; // Mostra apenas o banner discreto
  }
  
  return (
    <>
      <ConsentBanner />
      <ConsentModal />
    </>
  );
}

