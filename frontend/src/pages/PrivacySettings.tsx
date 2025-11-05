import { useState } from 'react';
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  ArrowDownTrayIcon,
  TrashIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../hooks/use-toast';

export default function PrivacySettings() {
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Recupera dados de consentimento
  const consentData = localStorage.getItem('bartab_lgpd_consent');
  const consent = consentData ? JSON.parse(consentData) : null;

  const handleExportData = async () => {
    try {
      // TODO: Chamar endpoint do backend
      const response = await fetch('/api/privacy/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Erro ao exportar dados');
      
      const data = await response.json();
      
      // Download como JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bartab-meus-dados-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Sucesso!',
        description: 'Seus dados foram exportados com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível exportar seus dados. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleRevokeConsent = () => {
    if (confirm('Deseja realmente revogar seu consentimento? Você será desconectado do sistema.')) {
      localStorage.removeItem('bartab_lgpd_consent');
      localStorage.removeItem('token');
      window.location.href = '/';
      
      toast({
        title: 'Consentimento Revogado',
        description: 'Seu consentimento foi revogado. Você será redirecionado.',
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'EXCLUIR MINHA CONTA') {
      toast({
        title: 'Erro',
        description: 'Digite exatamente "EXCLUIR MINHA CONTA" para confirmar.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // TODO: Chamar endpoint do backend
      const response = await fetch('/api/privacy/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Erro ao excluir conta');
      
      localStorage.clear();
      window.location.href = '/';
      
      toast({
        title: 'Conta Excluída',
        description: 'Sua conta e todos os dados foram excluídos permanentemente.',
      });
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir sua conta. Entre em contato com o suporte.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Privacidade e Dados
            </h1>
          </div>
          <p className="text-gray-600">
            Gerencie suas preferências de privacidade e exercite seus direitos conforme a LGPD
          </p>
        </div>

        {/* Consentimento Atual */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <InformationCircleIcon className="h-6 w-6 text-blue-600" />
            Status do Consentimento
          </h2>
          
          {consent ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  ✓ Consentimento Ativo
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p><strong>Data de aceite:</strong> {new Date(consent.date).toLocaleString('pt-BR')}</p>
                <p><strong>Versão:</strong> {consent.version}</p>
              </div>
              <button
                onClick={handleRevokeConsent}
                className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Revogar Consentimento
              </button>
            </div>
          ) : (
            <div className="text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              ⚠️ Nenhum consentimento registrado
            </div>
          )}
        </div>

        {/* Seus Direitos (LGPD Art. 18) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            Seus Direitos (LGPD)
          </h2>
          
          <div className="space-y-4">
            
            {/* Direito de Acesso */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                📥 Direito de Acesso e Portabilidade (Art. 18, I e V)
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Você pode baixar todos os seus dados em formato estruturado (JSON).
              </p>
              <button
                onClick={handleExportData}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Exportar Meus Dados
              </button>
            </div>

            {/* Direito de Correção */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                ✏️ Direito de Correção (Art. 18, III)
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Você pode corrigir seus dados através das páginas de edição de perfil e estabelecimento.
              </p>
              <a
                href="/profile"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Editar Meu Perfil
              </a>
            </div>

            {/* Direito de Exclusão */}
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <TrashIcon className="h-5 w-5 text-red-600" />
                Direito de Exclusão (Art. 18, VI)
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Você pode solicitar a exclusão permanente da sua conta e dados.
              </p>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  Excluir Minha Conta
                </button>
              ) : (
                <div className="mt-3 space-y-3">
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 font-medium mb-2">
                      ⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!
                    </p>
                    <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                      <li>Todos os seus dados serão excluídos permanentemente</li>
                      <li>Dados do estabelecimento e histórico serão removidos</li>
                      <li>Você perderá acesso imediato ao sistema</li>
                      <li>Dados fiscais serão mantidos pelo prazo legal (5 anos)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Digite "EXCLUIR MINHA CONTA" para confirmar:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="EXCLUIR MINHA CONTA"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== 'EXCLUIR MINHA CONTA'}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirmar Exclusão
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Links Úteis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📚 Documentos e Informações
          </h2>
          
          <div className="space-y-2">
            <a 
              href="https://github.com/eduardoklug/bartab/blob/main/POLITICA_PRIVACIDADE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-700 hover:underline"
            >
              📄 Política de Privacidade Completa
            </a>
            <a 
              href="https://github.com/eduardoklug/bartab/blob/main/TERMOS_DE_USO.md"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-700 hover:underline"
            >
              📜 Termos de Uso
            </a>
            <a 
              href="https://www.gov.br/anpd/pt-br"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-700 hover:underline"
            >
              🏛️ ANPD - Autoridade Nacional de Proteção de Dados
            </a>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">
              📧 Contato sobre Privacidade
            </h3>
            <p className="text-sm text-gray-600">
              Para questões sobre seus dados pessoais:
            </p>
            <p className="text-sm text-blue-600 font-medium">
              eduardo.klug7@gmail.com
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Prazo de resposta: até 15 dias úteis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

