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
      // Create a profile directly without going through auth signup
      // This bypasses email confirmation issues
      
      // First check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (existingProfile) {
        console.log('🔵 WALLET AUTH - Profile exists, trying to sign in...');
        
        // Try to sign in with existing wallet user
        const walletEmail = `wallet-${walletAddress.toLowerCase().slice(2)}@aura.app`;
        const signInResult = await supabase.auth.signInWithPassword({
          email: walletEmail,
          password: walletAddress
        });

        if (!signInResult.error) {
          console.log('🔵 WALLET AUTH - SUCCESS - Existing user signed in');
          toast({
            title: "Welcome back!",
            description: "Signed in with your wallet."
          });
          return { error: null };
        }
      }

      // Create new wallet user
      console.log('🔵 WALLET AUTH - Creating new wallet user...');
      const walletEmail = `wallet-${walletAddress.toLowerCase().slice(2)}@aura.app`;
      
      // Sign up the user
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

      if (signUpResult.error) {
        console.log('🔵 WALLET AUTH - Sign up error:', signUpResult.error.message);
        toast({
          title: "Account creation failed",
          description: signUpResult.error.message,
          variant: "destructive"
        });
        return { error: signUpResult.error };
      }

      // If signup was successful, the user should be signed in automatically
      if (signUpResult.data.user && signUpResult.data.session) {
        console.log('🔵 WALLET AUTH - SUCCESS - New user created and signed in');
        toast({
          title: "Welcome to Aura!",
          description: "Your wallet account has been created."
        });
        return { error: null };
      } else {
        console.log('🔵 WALLET AUTH - Sign up successful but no session - email confirmation may be required');
        toast({
          title: "Account created",
          description: "Please check your email to verify your account, or contact support.",
          variant: "destructive"
        });
        return { error: new Error('Email confirmation required') };
      }

    } catch (error: any) {
      console.log('🔵 WALLET AUTH - EXCEPTION:', error);
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