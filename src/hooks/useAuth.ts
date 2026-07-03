import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { subscribeToAuth } from '../firebase/authService';

interface AuthState {
  user: User | null;
  loading: boolean;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return subscribeToAuth((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  return { user, loading };
};
