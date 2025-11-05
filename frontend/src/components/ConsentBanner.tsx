import { useState, useEffect } from 'react';
import { ShieldCheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ConsentData {
  accepted: boolean;
  date: string;
  version: string;
}

/**
 * Banner discreto que aparece no topo quando usuário recusou
 * Permite aceitar o consentimento sem modal bloqueante
 */
export default function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consentStr = localStorage.getItem('bartab_lgpd_consent');
    
    if (consentStr) {
      try {
        const consent: ConsentData = JSON.parse(consentStr);
        // Mostra banner apenas se recusou
        setShowBanner(!consent.accepted);
      } catch (error) {
        console.error('Erro ao ler consentimento:', error);
      }
    }
  }, []);

  const handleAccept = () => {
    const consentData: ConsentData = {
      accepted: true,
      date: new Date().toISOString(),
      version: '1.0',
    };
    
    localStorage.setItem('bartab_lgpd_consent', JSON.stringify(consentData));
    setShowBanner(false);
    
    // Recarrega para aplicar o consentimento
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 border-b-2 border-yellow-400 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <ShieldCheckIcon className="h-6 w-6 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                ⚠️ Você recusou o consentimento de dados
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                Para utilizar o sistema, é necessário aceitar a Política de Privacidade e Termos de Uso conforme a LGPD.
                Você pode ler os documentos e aceitar quando estiver pronto.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href="/politica-privacidade"
              className="text-xs font-medium text-blue-700 hover:text-blue-800 underline"
            >
              Política
            </a>
            <a
              href="/termos-uso"
              className="text-xs font-medium text-blue-700 hover:text-blue-800 underline"
            >
              Termos
            </a>
            <button
              onClick={handleAccept}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              ✓ Aceitar Agora
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 text-gray-500 hover:text-gray-700"
              aria-label="Fechar"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

