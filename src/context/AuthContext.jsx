import { createContext, useContext, useState, useEffect } from 'react';
import { auth, ensureSeeded } from '../services/localDB';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureSeeded();
    const session = auth.getSession();
    if (session) setUser(session.user);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const session = auth.login(email, password);
    setUser(session.user);
    return session.user;
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);