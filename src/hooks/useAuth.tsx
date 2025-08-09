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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully."
        });
      }
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive"
      });
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
    console.log('🔄 signInWithWallet START:', walletAddress);
    
    try {
      // Create a valid email format for wallet users
      const walletEmail = `wallet-${walletAddress.toLowerCase().slice(2)}@aura.app`;
      console.log('📧 Generated email:', walletEmail);
      
      // Try to sign in first (existing wallet user)
      console.log('🔑 Attempting sign in...');
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: walletEmail,
        password: walletAddress
      });

      if (!signInError) {
        console.log('✅ Sign in SUCCESS');
        toast({
          title: "Welcome back!",
          description: "Signed in with your wallet."
        });
        return { error: null };
      }

      console.log('❌ Sign in failed:', signInError.message);

      // Only create account if user doesn't exist
      if (signInError.message === 'Invalid login credentials') {
        console.log('👤 Creating new account...');
        
        const { error: signUpError } = await supabase.auth.signUp({
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

        if (signUpError) {
          console.log('❌ Sign up failed:', signUpError.message);
          if (!signUpError.message.includes('rate limit')) {
            toast({
              title: "Account creation failed",
              description: signUpError.message,
              variant: "destructive"
            });
          }
          return { error: signUpError };
        }

        console.log('✅ Account created SUCCESS');
        toast({
          title: "Account created!",
          description: "Your wallet has been connected and account created."
        });
        return { error: null };
      }

      // Handle other errors
      console.log('❌ Other error:', signInError.message);
      if (!signInError.message.includes('rate limit')) {
        toast({
          title: "Authentication failed",
          description: signInError.message,
          variant: "destructive"
        });
      }
      return { error: signInError };

    } catch (error: any) {
      console.log('💥 Exception in signInWithWallet:', error);
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