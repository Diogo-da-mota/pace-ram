import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

export const AuthSessionContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthSession = () => {
  const context = useContext(AuthSessionContext);
  if (context === undefined) {
    throw new Error('useAuthSession must be used within an AuthSessionProvider');
  }
  return context;
};

export const useAuthSessionProvider = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se há uma sessão existente
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no login:', error);
        toast.error(`Erro no login: ${error.message}`);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Salvar preferência de "lembrar-me"
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }
        
        toast.success('Login realizado com sucesso!');
        return { success: true };
      }

      return { success: false, error: 'Erro desconhecido no login' };
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro interno do sistema');
      return { success: false, error: 'Erro interno do sistema' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('rememberMe');
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Erro no cadastro:', error);
        toast.error(`Erro no cadastro: ${error.message}`);
        return { success: false, error: error.message };
      }

      if (data.user) {
        toast.success('Cadastro realizado com sucesso!');
        return { success: true };
      }

      return { success: false, error: 'Erro desconhecido no cadastro' };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast.error('Erro interno do sistema');
      return { success: false, error: 'Erro interno do sistema' };
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
    signUp,
  };
};