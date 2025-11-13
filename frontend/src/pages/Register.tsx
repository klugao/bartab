import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [establishmentName, setEstablishmentName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const googleData = searchParams.get('data');

  useEffect(() => {
    if (!googleData) {
      navigate('/login');
    }
  }, [googleData, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!establishmentName.trim()) {
      setError('Por favor, insira o nome do estabelecimento');
      return;
    }

    console.log('🟢 [FRONTEND] Iniciando registro...');
    console.log('🟢 [FRONTEND] Nome do estabelecimento:', establishmentName);

    setIsLoading(true);
    setError('');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      console.log('🟢 [FRONTEND] API URL:', `${API_BASE_URL}/auth/register`);
      
      const requestBody = {
        googleData,
        establishmentName: establishmentName.trim(),
      };
      console.log('🟢 [FRONTEND] Enviando requisição...');
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🟢 [FRONTEND] Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [FRONTEND] Registro bem-sucedido!');
        console.log('✅ [FRONTEND] Token recebido:', data.access_token ? 'Sim' : 'Não');
        
        await login(data.access_token);
        console.log('✅ [FRONTEND] Login concluído, redirecionando...');
        navigate('/');
      } else {
        const errorData = await response.json();
        console.error('❌ [FRONTEND] Erro na resposta:', errorData);
        setError(errorData.message || 'Erro ao criar conta');
      }
    } catch (error) {
      console.error('❌ [FRONTEND] Erro ao registrar:', error);
      console.error('❌ [FRONTEND] Detalhes do erro:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      setError('Erro ao conectar com o servidor. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
      console.log('🟢 [FRONTEND] Finalizou tentativa de registro');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white font-bold">B</span>
          </div>
          <CardTitle className="text-3xl">Bem-vindo ao BarTab!</CardTitle>
          <CardDescription>
            Para completar seu cadastro, nos informe o nome do seu estabelecimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="establishmentName">Nome do Estabelecimento</Label>
              <Input
                id="establishmentName"
                type="text"
                placeholder="Ex: Bar do João"
                value={establishmentName}
                onChange={(e) => setEstablishmentName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;

