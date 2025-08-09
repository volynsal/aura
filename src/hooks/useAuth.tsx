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
      // Create a valid email format for wallet users
      const walletEmail = `wallet-${walletAddress.toLowerCase().slice(2)}@aura.app`;
      console.log('🔵 WALLET AUTH - Generated email:', walletEmail);
      
      // Try to sign in first (existing wallet user)
      console.log('🔵 WALLET AUTH - Attempting sign in...');
      
      const signInResult = await supabase.auth.signInWithPassword({
        email: walletEmail,
        password: walletAddress
      });
      
      console.log('🔵 WALLET AUTH - Sign in result:', {
        user: signInResult.data?.user?.id,
        session: !!signInResult.data?.session,
        error: signInResult.error?.message
      });

      if (!signInResult.error) {
        console.log('🔵 WALLET AUTH - SUCCESS - Signed in existing user');
        toast({
          title: "Welcome back!",
          description: "Signed in with your wallet."
        });
        return { error: null };
      }

      console.log('🔵 WALLET AUTH - Sign in failed:', signInResult.error?.message);

      // Only create account if user doesn't exist
      if (signInResult.error?.message === 'Invalid login credentials') {
        console.log('🔵 WALLET AUTH - Creating new account...');
        
        const signUpResult = await supabase.auth.signUp({
          email: walletEmail,
          password: walletAddress,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              wallet_address: walletAddress,
              display_name: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
              username: `user-${walletAddress.slice(2, 8)}`
            }
          }
        });

        console.log('🔵 WALLET AUTH - Sign up result:', {
          user: signUpResult.data?.user?.id,
          session: !!signUpResult.data?.session,
          error: signUpResult.error?.message
        });

        if (signUpResult.error) {
          console.log('🔵 WALLET AUTH - FAILED - Sign up error:', signUpResult.error.message);
          if (!signUpResult.error.message.includes('rate limit')) {
            toast({
              title: "Account creation failed",
              description: signUpResult.error.message,
              variant: "destructive"
            });
          }
          return { error: signUpResult.error };
        }

        console.log('🔵 WALLET AUTH - SUCCESS - Account created');
        toast({
          title: "Account created!",
          description: "Your wallet has been connected and account created."
        });
        return { error: null };
      }

      // Handle other errors
      console.log('🔵 WALLET AUTH - FAILED - Other error:', signInResult.error?.message);
      if (!signInResult.error?.message?.includes('rate limit')) {
        toast({
          title: "Authentication failed",
          description: signInResult.error?.message || "Unknown error",
          variant: "destructive"
        });
      }
      return { error: signInResult.error };

    } catch (error: any) {
      console.log('🔵 WALLET AUTH - EXCEPTION:', error);
      console.log('🔵 WALLET AUTH - EXCEPTION stack:', error.stack);
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