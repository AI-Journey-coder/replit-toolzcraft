import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { watchAuth, signOut as fbSignOut, firebaseConfigured, type FirebaseUser } from "@/lib/firebase";
import { syncUser, type ApiUser } from "@/lib/api";

interface AuthState {
  firebaseUser: FirebaseUser | null;
  user: ApiUser | null;
  loading: boolean;
  configured: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  firebaseUser: null,
  user: null,
  loading: true,
  configured: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return watchAuth(async (fb) => {
      setFirebaseUser(fb);
      if (fb) {
        try {
          const token = await fb.getIdToken();
          setUser(await syncUser(token));
        } catch (err) {
          console.error("Failed to sync user", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  const signOut = async () => {
    await fbSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ firebaseUser, user, loading, configured: firebaseConfigured, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
