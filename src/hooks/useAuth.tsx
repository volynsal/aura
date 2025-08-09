import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  linkWallet: (walletAddress: string) => Promise<{ error: any }>;
  signInWithWallet: (walletAddress: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    
    // Get existing session first
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account."
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in."
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Always attempt to sign out regardless of session state
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      
      if (error) {
        console.error('Sign out error:', error);
        // Don't show error toast for missing session - just clear local state
        if (!error.message.includes('session')) {
          toast({
            title: "Sign out failed",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully."
        });
      }
      
      // Always clear local state
      setSession(null);
      setUser(null);
      
    } catch (error: any) {
      console.error('Sign out exception:', error);
      // Clear local state even if sign out fails
      setSession(null);
      setUser(null);
    }
  };

  const linkWallet = async (walletAddress: string) => {
    try {
      if (!user) {
        return { error: new Error('User not authenticated') };
      }

      const { error } = await supabase
        .from('profiles')
        .update({ wallet_address: walletAddress })
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Wallet linking failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "Wallet linked!",
        description: "Your wallet has been successfully linked to your account."
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Wallet linking failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signInWithWallet = async (walletAddress: string) => {
    console.log('🔵 WALLET AUTH START - Address:', walletAddress);
    
    try {
      // Simplified approach - just create a wallet user directly
      const walletEmail = `wallet-${walletAddress.toLowerCase().slice(2)}@aura.app`;
      console.log('🔵 WALLET AUTH - Generated email:', walletEmail);
      
      // First, try to sign in if user exists
      console.log('🔵 WALLET AUTH - Attempting sign in...');
      const signInResult = await supabase.auth.signInWithPassword({
        email: walletEmail,
        password: walletAddress
      });
      
      console.log('🔵 WALLET AUTH - Sign in result:', {
        success: !signInResult.error,
        error: signInResult.error?.message,
        hasUser: !!signInResult.data?.user,
        hasSession: !!signInResult.data?.session
      });

      if (!signInResult.error && signInResult.data?.session) {
        console.log('🔵 WALLET AUTH - SUCCESS - Existing user signed in');
        toast({
          title: "Welcome back!",
          description: "Signed in with your wallet."
        });
        return { error: null };
      }

      // If sign in failed, create a new user
      console.log('🔵 WALLET AUTH - Creating new user...');
      const signUpResult = await supabase.auth.signUp({
        email: walletEmail,
        password: walletAddress,
        options: {
          data: {
            wallet_address: walletAddress,
            display_name: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
            username: `user-${walletAddress.slice(2, 8)}`
          }
        }
      });

      console.log('🔵 WALLET AUTH - Sign up result:', {
        success: !signUpResult.error,
        error: signUpResult.error?.message,
        hasUser: !!signUpResult.data?.user,
        hasSession: !!signUpResult.data?.session,
        needsConfirmation: signUpResult.data?.user && !signUpResult.data?.session
      });

      if (signUpResult.error) {
        console.log('🔵 WALLET AUTH - FAILED - Sign up error:', signUpResult.error.message);
        toast({
          title: "Account creation failed",
          description: signUpResult.error.message,
          variant: "destructive"
        });
        return { error: signUpResult.error };
      }

      if (signUpResult.data?.user && signUpResult.data?.session) {
        console.log('🔵 WALLET AUTH - SUCCESS - New user created and signed in automatically');
        toast({
          title: "Welcome to Aura!",
          description: "Your wallet account has been created."
        });
        return { error: null };
      } else if (signUpResult.data?.user && !signUpResult.data?.session) {
        console.log('🔵 WALLET AUTH - Email confirmation required');
        toast({
          title: "Account created, but email confirmation is required",
          description: "Please disable email confirmation in Supabase Auth settings for wallet users.",
          variant: "destructive"
        });
        return { error: new Error('Email confirmation required') };
      }

      console.log('🔵 WALLET AUTH - Unexpected state');
      return { error: new Error('Unexpected authentication state') };

    } catch (error: any) {
      console.log('🔵 WALLET AUTH - EXCEPTION:', error);
      console.log('🔵 WALLET AUTH - EXCEPTION Message:', error.message);
      console.log('🔵 WALLET AUTH - EXCEPTION Stack:', error.stack);
      toast({
        title: "Authentication error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    linkWallet,
    signInWithWallet
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};