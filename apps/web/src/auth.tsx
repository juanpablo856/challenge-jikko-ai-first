import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, clearToken, getToken, setToken, setUnauthorizedHandler } from './api';

interface AuthState {
  authed: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthState | null>(null);
export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth outside provider');
  return v;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(!!getToken());
  const navigate = useNavigate();

  useEffect(() => {
    // On a 401 anywhere, drop the session and bounce to login.
    setUnauthorizedHandler(() => {
      setAuthed(false);
      navigate('/login');
    });
  }, [navigate]);

  const login = async (email: string, password: string) => {
    const { accessToken } = await api.login(email, password);
    setToken(accessToken);
    setAuthed(true);
  };
  const register = async (email: string, password: string) => {
    await api.register(email, password);
    await login(email, password);
  };
  const logout = () => {
    clearToken();
    setAuthed(false);
    navigate('/login');
  };

  return <Ctx.Provider value={{ authed, login, register, logout }}>{children}</Ctx.Provider>;
}
