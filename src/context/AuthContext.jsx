import { createContext, useContext, useEffect, useState } from 'react';
import { AuthAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let unsub;
    (async () => {
      unsub = await AuthAPI.onChange((u) => {
        setUser(u);
        setReady(true);
      });
    })();
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const value = {
    user,
    ready,
    signUp: async (email, password) => {
      const u = await AuthAPI.signUp(email, password);
      setUser(u);
      return u;
    },
    signIn: async (email, password) => {
      const u = await AuthAPI.signIn(email, password);
      setUser(u);
      return u;
    },
    signOut: async () => {
      await AuthAPI.signOut();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
