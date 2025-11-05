import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { ShieldCheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface ConsentData {
  accepted: boolean;
  date: string;
  version: string;
}

export default function ConsentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    const consentStr = localStorage.getItem('bartab_lgpd_consent');
    if (!consentStr) {
      // Aguarda um pequeno delay para não aparecer imediatamente
      setTimeout(() => setIsOpen(true), 500);
    } else {
      try {
        const consent: ConsentData = JSON.parse(consentStr);
        
        // Se aceitou, não mostra mais o modal
        if (consent.accepted) {
          setHasAccepted(true);
          setIsOpen(false);
        } else {
          // Se recusou, mostra o modal novamente para dar chance de aceitar
          setHasAccepted(false);
          setTimeout(() => setIsOpen(true), 500);
        }
      } catch (error) {
        console.error('Erro ao ler consentimento:', error);
        setIsOpen(true);
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
    setHasAccepted(true);
    setIsOpen(false);
  };

  const handleReject = () => {
    // Armazena que o usuário recusou (mas permite mudar de ideia depois)
    const rejectData: ConsentData = {
      accepted: false,
      date: new Date().toISOString(),
      version: '1.0',
    };
    
    localStorage.setItem('bartab_lgpd_consent', JSON.stringify(rejectData));
    setIsOpen(false);
    
    // Redireciona para a página de login ou home
    // O ProtectedRoute vai bloquear o acesso às funcionalidades
    window.location.href = '/login';
  };

  if (hasAccepted) return null;

  return (
    <Dialog 
      open={isOpen} 
      onClose={() => {}} 
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      
      {/* Container centralizado */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl w-full max-h-[90vh] rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col">
          
          {/* Header - Fixo */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="h-7 w-7 text-white flex-shrink-0" />
              <div>
                <Dialog.Title className="text-xl font-bold text-white">
                  Privacidade e Proteção de Dados
                </Dialog.Title>
                <p className="text-blue-100 text-xs mt-0.5">
                  Conforme a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)
                </p>
              </div>
            </div>
          </div>

          {/* Content - Com Scroll */}
          <div className="px-6 py-4 overflow-y-auto flex-1">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed mb-3 text-sm">
                Bem-vindo ao <strong>BarTab</strong>! Antes de continuar, precisamos do seu 
                <strong> consentimento expresso</strong> para coletar e processar seus dados pessoais.
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3">
                <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  O que faremos com seus dados:
                </h3>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5 flex-shrink-0">✓</span>
                    <span>Coletar seu <strong>nome, e-mail e foto</strong> via Google OAuth</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5 flex-shrink-0">✓</span>
                    <span>Armazenar informações do seu <strong>estabelecimento</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5 flex-shrink-0">✓</span>
                    <span>Processar <strong>clientes, vendas e pagamentos</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5 flex-shrink-0">✓</span>
                    <span>Utilizar <strong>cookies</strong> para sessão</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5 flex-shrink-0">✓</span>
                    <span>Registrar <strong>logs</strong> para segurança</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                <h4 className="font-semibold text-gray-900 mb-1.5 text-sm">🔒 Seus Direitos (LGPD - Art. 18):</h4>
                <p className="text-xs text-gray-700 mb-1.5">
                  Você tem direito a:
                </p>
                <ul className="text-xs text-gray-600 space-y-0.5 list-disc list-inside">
                  <li><strong>Acessar</strong> seus dados a qualquer momento</li>
                  <li><strong>Corrigir</strong> informações incorretas</li>
                  <li><strong>Excluir</strong> seus dados (quando não houver obrigação legal de mantê-los)</li>
                  <li><strong>Exportar</strong> seus dados em formato estruturado</li>
                  <li><strong>Revogar</strong> este consentimento quando desejar</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-3">
                <p className="text-xs text-yellow-800">
                  ⚠️ <strong>Importante:</strong> Seus dados são protegidos com criptografia 
                  e controles de acesso. Não compartilhamos com terceiros, exceto serviços 
                  essenciais (Google OAuth, hospedagem) e quando exigido por lei.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <a 
                  href="/politica-privacidade"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors"
                >
                  📄 Política de Privacidade
                </a>
                <a 
                  href="/termos-uso"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors"
                >
                  📜 Termos de Uso
                </a>
              </div>

              <p className="text-xs text-gray-500 mt-3 text-center leading-relaxed">
                Ao clicar em "Aceitar e Continuar", você declara ter lido e concordado com 
                nossa Política de Privacidade e Termos de Uso.
              </p>
            </div>
          </div>

          {/* Footer com botões - Fixo */}
          <div className="bg-gray-50 px-6 py-3 flex flex-col sm:flex-row gap-2 justify-end border-t border-gray-200 flex-shrink-0">
            <button
              onClick={handleReject}
              className="px-5 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Recusar
            </button>
            <button
              onClick={handleAccept}
              className="px-5 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium shadow-md hover:shadow-lg transition-all"
            >
              ✓ Aceitar e Continuar
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

