import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from './ui/button';
import { X, Download, RefreshCw } from 'lucide-react';

export function PWAInstallPrompt() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log('Service Worker registrado:', swUrl);
      // Verificar atualizações a cada hora
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('Erro ao registrar Service Worker:', error);
    },
  });

  useEffect(() => {
    // Captura o evento de instalação do PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detecta se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('PWA já está instalado');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} a instalação`);
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Salva no localStorage para não mostrar novamente nesta sessão
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  // Banner de atualização disponível
  if (needRefresh) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-bottom">
        <div className="flex items-start gap-3">
          <RefreshCw className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Atualização Disponível</h3>
            <p className="text-sm text-blue-100 mb-3">
              Uma nova versão do BarTab está disponível. Recarregue para atualizar.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                size="sm"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Atualizar Agora
              </Button>
              <Button
                onClick={() => setNeedRefresh(false)}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-blue-700"
              >
                Mais Tarde
              </Button>
            </div>
          </div>
          <button
            onClick={() => setNeedRefresh(false)}
            className="text-white hover:text-blue-200 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Banner de instalação do PWA
  if (showInstallPrompt && deferredPrompt) {
    // Verifica se o usuário já dispensou recentemente
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 24 * 60 * 60 * 1000) {
      return null;
    }

    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-bottom">
        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Instalar BarTab</h3>
            <p className="text-sm text-blue-100 mb-3">
              Instale o aplicativo em seu dispositivo para acesso rápido e modo offline.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Instalar
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-blue-700"
              >
                Agora Não
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-blue-200 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}

