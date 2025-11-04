import { useState, useEffect } from 'react';
import { CogIcon, BuildingStorefrontIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { profileApi } from '../services/api';
import type { Establishment, UpdateEstablishmentDto } from '../types';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { toast } = useToast();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateEstablishmentDto>({
    name: '',
    address: '',
    phone: '',
    email: '',
    pix_qr_code: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.get();
      setEstablishment(data);
      setFormData({
        name: data.name || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        pix_qr_code: data.pix_qr_code || '',
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast({
        title: '❌ Erro',
        description: 'Não foi possível carregar as configurações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await profileApi.update(formData);
      setEstablishment(updated);
      toast({
        title: '✅ Sucesso',
        description: 'Configurações atualizadas com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: '❌ Erro',
        description: 'Não foi possível atualizar as configurações',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof UpdateEstablishmentDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: '❌ Erro',
        description: 'Por favor, selecione um arquivo de imagem',
        variant: 'destructive',
      });
      return;
    }

    // Validar tamanho (máximo 3MB - após conversão base64 fica ~4MB)
    if (file.size > 3 * 1024 * 1024) {
      toast({
        title: '❌ Erro',
        description: 'A imagem deve ter no máximo 3MB',
        variant: 'destructive',
      });
      return;
    }

    // Converter para base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({ ...prev, pix_qr_code: base64String }));
    };
    reader.onerror = () => {
      toast({
        title: '❌ Erro',
        description: 'Erro ao processar a imagem',
        variant: 'destructive',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQrCode = () => {
    setFormData(prev => ({ ...prev, pix_qr_code: '' }));
  };

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair?')) {
      logout();
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <CogIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        </div>
        <p className="text-gray-600">Gerencie as informações do seu estabelecimento</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações Básicas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BuildingStorefrontIcon className="h-6 w-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Informações do Estabelecimento</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Estabelecimento *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Bar do João"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Rua Principal, 123"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: (11) 98765-4321"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: contato@bar.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Configurações PIX */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">📱</span>
            <h2 className="text-xl font-semibold text-gray-900">QR Code PIX</h2>
          </div>

          <div className="space-y-4">
            {/* Visualização do QR Code atual */}
            {formData.pix_qr_code ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code Atual
                </label>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col items-center gap-4">
                  <img
                    src={formData.pix_qr_code}
                    alt="QR Code PIX"
                    className="max-w-xs w-full h-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '';
                      toast({
                        title: '⚠️ Atenção',
                        description: 'Não foi possível carregar a imagem do QR Code',
                        variant: 'destructive',
                      });
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveQrCode}
                    className="px-4 py-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                  >
                    Remover QR Code
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <p className="text-sm text-amber-800">
                  ⚠️ Nenhum QR Code configurado. Faça upload de uma imagem para aceitar pagamentos via PIX.
                </p>
              </div>
            )}

            {/* Upload de nova imagem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.pix_qr_code ? 'Substituir QR Code' : 'Fazer Upload do QR Code PIX'}
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-2 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mb-1 text-sm text-gray-500">
                      <span className="font-semibold">Clique para fazer upload</span> ou arraste
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG (máx. 3MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Faça upload da imagem do QR Code PIX do seu estabelecimento. A imagem será salva de forma segura.
              </p>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={loadProfile}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>

      {/* Seção de Logout */}
      <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightOnRectangleIcon className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-semibold text-red-900">Sair da Conta</h2>
            </div>
            <p className="text-sm text-red-700">
              Clique no botão ao lado para encerrar sua sessão e sair do sistema.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="ml-4 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

