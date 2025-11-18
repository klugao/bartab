import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../lib/config';
import { isTokenExpiringSoon, isTokenExpired } from '../lib/token-utils';

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

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setOriginalUser(null);
    setOriginalToken(null);
    // SECURITY: Remove token do localStorage ao fazer logout
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  const refreshToken = useCallback(async (currentToken: string): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.access_token;
        setToken(newToken);
        localStorage.setItem('token', newToken);
        console.log('✅ Token renovado automaticamente');
        return newToken;
      } else {
        console.warn('Falha ao renovar token:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      return null;
    }
  }, []);

  const login = useCallback(async (newToken: string) => {
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
      } else if (response.status === 401) {
        // Token inválido ou expirado - tenta renovar primeiro
        console.warn('Token inválido ou expirado, tentando renovar...');
        const refreshedToken = await refreshToken(newToken);
        if (refreshedToken) {
          // Se conseguiu renovar, tenta buscar dados do usuário novamente
          const retryResponse = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${refreshedToken}`,
            },
          });
          if (retryResponse.ok) {
            const userData = await retryResponse.json();
            setUser(userData);
            return;
          }
        }
        // Se não conseguiu renovar, faz logout
        localStorage.removeItem('token');
        logout();
      } else {
        throw new Error('Falha ao buscar dados do usuário');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      // Só faz logout se não for um erro de rede temporário
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Erro de rede - mantém o token mas não define o usuário
        console.warn('Erro de rede ao validar token, mantendo token salvo');
        setIsLoading(false);
        return;
      }
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout, refreshToken]);

  // Intervalo para verificar e renovar token automaticamente
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // SECURITY: localStorage é usado para persistir a sessão do usuário
    // Verificar se há um token salvo ao carregar a aplicação
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      login(savedToken);
    } else {
      setIsLoading(false);
    }

    // Configurar intervalo para verificar e renovar token automaticamente
    // Verifica a cada 30 minutos se o token está próximo de expirar
    refreshIntervalRef.current = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      if (currentToken && token) {
        // Se o token está próximo de expirar (menos de 1 hora), renova
        if (isTokenExpiringSoon(currentToken, 60)) {
          console.log('🔄 Token próximo de expirar, renovando automaticamente...');
          refreshToken(currentToken).then((newToken) => {
            if (!newToken) {
              // Se não conseguiu renovar e o token está expirado, faz logout
              if (isTokenExpired(currentToken)) {
                console.warn('Token expirado e não foi possível renovar, fazendo logout');
                logout();
              }
            }
          });
        }
      }
    }, 30 * 60 * 1000); // 30 minutos

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [login, refreshToken, logout, token]);

  const impersonate = useCallback(async (establishmentId: string) => {
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
  }, [user, token, originalUser, originalToken, navigate]);

  const stopImpersonating = useCallback(async () => {
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
  }, [originalToken, originalUser, logout, navigate]);

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

