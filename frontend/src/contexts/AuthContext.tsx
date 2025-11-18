import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../lib/config';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: 'Proprietario' | 'AdministradorSistema';
  establishment: {
    id: string;
    name: string;
    active?: boolean;
    statusAprovacao: 'Pendente' | 'Aprovado' | 'Rejeitado';
  };
  isImpersonating?: boolean;
  originalEstablishmentId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  originalUser: User | null;
  originalToken: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  impersonate: (establishmentId: string) => Promise<void>;
  stopImpersonating: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [originalToken, setOriginalToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // SECURITY: localStorage é usado para persistir a sessão do usuário
    // Verificar se há um token salvo ao carregar a aplicação
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      login(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (newToken: string) => {
    try {
      setToken(newToken);
      // SECURITY: Armazena token no localStorage para persistência de sessão
      localStorage.setItem('token', newToken);

      // Buscar dados do usuário
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${newToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        throw new Error('Falha ao buscar dados do usuário');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setOriginalUser(null);
    setOriginalToken(null);
    // SECURITY: Remove token do localStorage ao fazer logout
    localStorage.removeItem('token');
    navigate('/login');
  };

  const impersonate = async (establishmentId: string) => {
    try {
      // Salva o usuário e token original antes de impersonar
      if (!originalUser && user) {
        setOriginalUser(user);
      }
      if (!originalToken && token) {
        setOriginalToken(token);
      }

      // Chama o endpoint de impersonation
      const response = await fetch(`${API_BASE_URL}/admin/impersonate/${establishmentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao impersonar estabelecimento');
      }

      const data = await response.json();

      // Atualiza o token
      const newToken = data.access_token;
      setToken(newToken);
      localStorage.setItem('token', newToken);

      // Busca os dados atualizados do usuário
      const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${newToken}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
        // Navega para a home do estabelecimento impersonado
        navigate('/');
      } else {
        throw new Error('Falha ao buscar dados do usuário');
      }
    } catch (error) {
      console.error('Erro ao impersonar estabelecimento:', error);
      throw error;
    }
  };

  const stopImpersonating = async () => {
    try {
      // Se houver token original, restaura
      if (originalToken && originalUser) {
        setToken(originalToken);
        localStorage.setItem('token', originalToken);

        // Busca os dados atualizados do usuário original
        const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${originalToken}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          setOriginalUser(null);
          setOriginalToken(null);
          // Navega para o dashboard admin
          navigate('/admin');
        } else {
          throw new Error('Falha ao buscar dados do usuário original');
        }
      } else {
        // Se não houver token original, faz logout
        logout();
      }
    } catch (error) {
      console.error('Erro ao parar impersonation:', error);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, originalUser, originalToken, login, logout, impersonate, stopImpersonating, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

