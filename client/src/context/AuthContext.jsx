import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { signOut } = useClerk();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Clerk is signed in — sync with our MongoDB (api.js fetches a fresh
    // Clerk token for this request automatically, no need to cache one here)
    api.get('/auth/me')
      .then(res => res && setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [isSignedIn, isLoaded]);

  function logout() {
    setUser(null);
    signOut();
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
