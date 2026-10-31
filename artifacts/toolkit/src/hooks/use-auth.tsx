import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { watchAuth, signOut as fbSignOut, firebaseConfigured, type FirebaseUser } from "@/lib/firebase";
import { syncUser, type ApiUser } from "@/lib/api";

interface AuthState {
  error: string;
  firebaseUser: FirebaseUser | null;
  user: ApiUser | null;
  loading: boolean;
  configured: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  error: "",
  firebaseUser: null,
  user: null,
  loading: true,
  configured: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [error,setError]=useState("");
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let version = 0;
    const unsubscribe = watchAuth(async (fb) => {
      const current = ++version;
      setFirebaseUser(fb);setError("");
      if (fb) {
        try {
          const token = await fb.getIdToken();
          const synced = await syncUser(token);
          if (current !== version) return;
          setUser(synced);
        } catch (err) {
          if (current !== version) return;
          setError("Sign-in could not be completed. The account may be disabled or the service unavailable. Try again or contact support.");
          setUser(null);
        }
      } else {
        setUser(null);
      }
      if (current === version) setLoading(false);
    });
    return () => {
      version++;
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await fbSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ error, firebaseUser, user, loading, configured: firebaseConfigured, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
