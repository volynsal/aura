import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { testSupabaseConnection, diagnoseCurrentState } from '@/utils/diagnostics';

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
    
    // Run diagnostics on mount
    diagnoseCurrentState();
    testSupabaseConnection();
    
    // Get existing session first
    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🔍 Error getting session:', error);
        }
        
        if (mounted) {
          console.log('🔍 Initial session:', { hasSession: !!session, hasUser: !!session?.user });
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('🔍 Exception getting initial session:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔥 AUTH STATE CHANGE:', { event, hasSession: !!session, hasUser: !!session?.user });
        
        if (mounted) {
          if (event === 'SIGNED_OUT') {
            console.log('🔥 SIGNED_OUT event - clearing state');
            setSession(null);
            setUser(null);
            setLoading(false);
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            console.log('🔥 SIGNED_IN/TOKEN_REFRESHED event - updating state');
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
          } else {
            console.log('🔥 Other auth event:', event);
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
          }
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
    console.log('🟢 SIGNUP START - Email:', email, 'UserData:', userData);
    try {
      const redirectUrl = `${window.location.origin}/`;
      console.log('🟢 SIGNUP - Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });

      console.log('🟢 SIGNUP RESULT:', {
        success: !error,
        error: error?.message,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        needsConfirmation: data?.user && !data?.session
      });

      if (error) {
        console.log('🟢 SIGNUP ERROR:', error);
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      if (data?.user && data?.session) {
        console.log('🟢 SIGNUP SUCCESS - User created and signed in automatically');
        toast({
          title: "Welcome to Aura!",
          description: "Your account has been created successfully."
        });
        return { error: null };
      } else if (data?.user && !data?.session) {
        console.log('🟢 SIGNUP - Email confirmation required');
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link. Or disable email confirmation in Supabase settings.",
          variant: "default"
        });
        return { error: null }; // This is actually success, just needs confirmation
      }

      console.log('🟢 SIGNUP - No user created');
      toast({
        title: "Account creation failed", 
        description: "Something went wrong creating your account."
      });
      return { error: new Error('No user created') };

    } catch (error: any) {
      console.log('🟢 SIGNUP EXCEPTION:', error);
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔵 SIGNIN START - Email:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('🔵 SIGNIN RESULT:', {
        success: !error,
        error: error?.message,
        hasUser: !!data?.user,
        hasSession: !!data?.session
      });

      if (error) {
        console.error('🔵 SIGNIN ERROR:', error);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      console.log('🔵 SIGNIN SUCCESS');
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in."
      });

      return { error: null };
    } catch (error: any) {
      console.error('🔵 SIGNIN EXCEPTION:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "Network connection error. Please try again.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    console.log('🚪 SIGNOUT: Starting logout process...');
    console.log('🚪 SIGNOUT: Current user before logout:', user?.id);
    console.log('🚪 SIGNOUT: Current session before logout:', !!session);

    try {
      // 0. Mark signout in progress to block auto re-auth (e.g., wallet auto-connect)
      const now = Date.now().toString();
      try {
        localStorage.setItem('signout-in-progress', now);
        sessionStorage.setItem('signout-in-progress', now);
      } catch (e) {
        console.log('🚪 SIGNOUT: Unable to set signout-in-progress flag', e);
      }

      // 1. Clear local auth state immediately (optimistic UI)
      console.log('🚪 SIGNOUT: Clearing local state immediately');
      setSession(null);
      setUser(null);
      setLoading(false);

      // 2. Revoke tokens and clear Supabase session (GLOBAL)
      console.log('🚪 SIGNOUT: Calling Supabase signOut (global)');
      const { error } = await supabase.auth.signOut({ scope: 'global' });

      if (error) {
        console.error('🚪 SIGNOUT: Supabase error:', error);
        // Continue with cleanup even if there's an error
      } else {
        console.log('🚪 SIGNOUT: Supabase logout successful');
      }

      // 3. Clear sensitive storage/caches that can trigger re-auth
      console.log('🚪 SIGNOUT: Clearing storage caches');
      try {
        const keysToRemove = [
          'walletconnect',
          'wagmi.store',
          'wagmi.cache',
          'wagmi.recentConnectorId',
          // Supabase auth token key (project specific)
          'sb-oyacwfzdaciskhlclrby-auth-token'
        ];
        keysToRemove.forEach((key) => {
          try { localStorage.removeItem(key); } catch {}
          try { sessionStorage.removeItem(key); } catch {}
        });
      } catch (e) {
        console.log('🚪 SIGNOUT: Storage clear error (ignored):', e);
      }

      // 4. Notify and redirect to Login to avoid private pages flicker
      toast({
        title: 'Signed out successfully',
        description: 'Redirecting to login...'
      });

      console.log('🚪 SIGNOUT: Redirecting to /login');
      // Ensure we navigate after signOut resolves
      window.location.replace('/login');

    } catch (error: any) {
      console.error('🚪 SIGNOUT ERROR:', error);

      // Even if there's an error, clear everything
      setUser(null);
      setSession(null);
      setLoading(false);

      toast({
        title: 'Signed out',
        description: 'Redirecting to login...'
      });

      window.location.replace('/login');
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
      // Simple approach: create wallet user directly without checking existing profiles first
      const walletEmail = `wallet-${walletAddress.toLowerCase().slice(2)}@aura.app`;
      const username = `user-${walletAddress.slice(2, 8).toLowerCase()}`;
      const displayName = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
      
      console.log('🔵 WALLET AUTH - Attempting sign in first...', { walletEmail });
      
      // Try to sign in first
      const signInResult = await supabase.auth.signInWithPassword({
        email: walletEmail,
        password: walletAddress
      });

      console.log('🔵 WALLET AUTH - Sign in attempt:', {
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

      // If sign in failed, create new user
      console.log('🔵 WALLET AUTH - Creating new wallet user...', { 
        walletEmail, 
        username, 
        displayName,
        walletAddress 
      });
      
      const signUpResult = await supabase.auth.signUp({
        email: walletEmail,
        password: walletAddress,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            wallet_address: walletAddress.toLowerCase(),
            display_name: displayName,
            username: username
          }
        }
      });

      console.log('🔵 WALLET AUTH - Sign up result:', {
        success: !signUpResult.error,
        error: signUpResult.error?.message,
        errorCode: signUpResult.error?.name,
        hasUser: !!signUpResult.data?.user,
        hasSession: !!signUpResult.data?.session,
        userId: signUpResult.data?.user?.id
      });

      if (signUpResult.error) {
        // If user already exists but sign-in failed, try again
        if (signUpResult.error.message.includes('already been registered') || 
            signUpResult.error.message.includes('already registered')) {
          console.log('🔵 WALLET AUTH - User exists, retrying sign in...');
          
          const retrySignIn = await supabase.auth.signInWithPassword({
            email: walletEmail,
            password: walletAddress
          });

          if (!retrySignIn.error && retrySignIn.data?.session) {
            console.log('🔵 WALLET AUTH - SUCCESS - Retry sign in worked');
            toast({
              title: "Welcome back!",
              description: "Signed in with your wallet."
            });
            return { error: null };
          } else {
            console.log('🔵 WALLET AUTH - Retry sign in also failed:', retrySignIn.error?.message);
          }
        }
        
        console.log('🔵 WALLET AUTH - FAILED - Sign up error:', signUpResult.error);
        toast({
          title: "Wallet authentication failed",
          description: `Error: ${signUpResult.error.message}`,
          variant: "destructive"
        });
        return { error: signUpResult.error };
      }

      if (signUpResult.data?.user) {
        if (signUpResult.data?.session) {
          console.log('🔵 WALLET AUTH - SUCCESS - New user created and signed in');
          toast({
            title: "Welcome to Aura!",
            description: "Your wallet account has been created."
          });
          return { error: null };
        } else {
          console.log('🔵 WALLET AUTH - User created but no session - this should not happen with email confirmation disabled');
          toast({
            title: "Account created but sign-in failed",
            description: "Try disconnecting and reconnecting your wallet.",
            variant: "destructive"
          });
          return { error: new Error('User created but no session established') };
        }
      }

      console.log('🔵 WALLET AUTH - No user or session created');
      toast({
        title: "Wallet authentication failed",
        description: "Failed to create or sign in wallet account.",
        variant: "destructive"
      });
      return { error: new Error('No user created') };

    } catch (error: any) {
      console.log('🔵 WALLET AUTH - EXCEPTION:', error);
      console.error('🔵 WALLET AUTH - Full error object:', error);
      toast({
        title: "Wallet authentication error", 
        description: error.message || "Something went wrong during wallet authentication",
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