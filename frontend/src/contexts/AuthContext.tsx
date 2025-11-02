import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
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
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
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
    // SECURITY: Remove token do localStorage ao fazer logout
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
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

