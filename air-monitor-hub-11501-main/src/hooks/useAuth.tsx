import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if user is admin after state update
          setTimeout(() => {
            checkAdminStatus(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (!error && data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Connect to our Flask backend instead of Supabase
      const response = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: fullName,
          email: email,
          password: password,
          city: 'Delhi' // Default city
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const error = { message: data.error || 'Failed to register' };
        toast({
          title: 'Signup Error',
          description: error.message,
          variant: 'destructive'
        });
        return { error };
      } else {
        toast({
          title: 'Success!',
          description: 'Account created successfully. You can now sign in.',
        });
        return { error: null };
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: 'Signup Error',
        description: error.message,
        variant: 'destructive'
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Connect to our Flask backend instead of Supabase
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const error = { message: data.error || 'Failed to login' };
        toast({
          title: 'Login Error',
          description: error.message,
          variant: 'destructive'
        });
        return { error };
      } else {
        // Assuming the backend returns a token or session info
        // You might need to handle the response data here
        // For now, just reloading the page to let the auth state listener do its work
        window.location.reload();
        return { error: null };
      }
    } catch (error: any) {
      toast({
        title: 'Login Error',
        description: 'Failed to fetch',
        variant: 'destructive'
      });
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        toast({
          title: 'Google Login Error',
          description: error.message,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Google Login Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    toast({
      title: 'Signed Out',
      description: 'You have been successfully signed out.',
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}