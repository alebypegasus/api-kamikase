import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  userName: string | null;
  userEmail: string | null;
  isAdmin: boolean;
  login: (token: string, nome: string, email: string, is_admin: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('userEmail'));
  const [isAdmin, setIsAdmin] = useState<boolean>(localStorage.getItem('isAdmin') === 'true');

  const login = (newToken: string, nome: string, email: string, is_admin: boolean) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userName', nome);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('isAdmin', is_admin.toString());

    setToken(newToken);
    setUserName(nome);
    setUserEmail(email);
    setIsAdmin(is_admin);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAdmin');

    setToken(null);
    setUserName(null);
    setUserEmail(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ token, userName, userEmail, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
