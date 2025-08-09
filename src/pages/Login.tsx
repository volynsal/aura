import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Wallet, Coins } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAccount, useConnect, useDisconnect } from 'wagmi';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [walletConnecting, setWalletConnecting] = useState(false);
  
  const { signUp, signIn, signInWithWallet, signOut, user } = useAuth();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Redirect authenticated users to profile page for setup
  useEffect(() => {
    if (user) {
      console.log('🔀 User authenticated, redirecting to profile for setup');
      navigate('/profile');
    }
  }, [user, navigate]);

  // Auto-authenticate when wallet connects (for signup flow)
  useEffect(() => {
    // Check if we just signed out to prevent immediate re-auth
    const signoutInProgress = localStorage.getItem('signout-in-progress');
    if (signoutInProgress) {
      const signoutTime = parseInt(signoutInProgress);
      const timeSinceSignout = Date.now() - signoutTime;
      
      // Block auto-auth for 5 seconds after signout
      if (timeSinceSignout < 5000) {
        console.log('🚫 BLOCKING AUTO-AUTH: Recent signout detected', timeSinceSignout, 'ms ago');
        return;
      } else {
        // Clean up the flag if enough time has passed
        localStorage.removeItem('signout-in-progress');
        sessionStorage.removeItem('signout-in-progress');
      }
    }
    
    console.log('Wallet connection state:', { isConnected, address, walletConnecting, user });
    
    if (isConnected && address && !walletConnecting && !user) {
      console.log('Starting wallet authentication for:', address);
      setWalletConnecting(true);
      
      const authenticateWallet = async () => {
        console.log('🔄 Executing signInWithWallet for:', address);
        try {
          const result = await signInWithWallet(address);
          console.log('✅ signInWithWallet completed:', result);
          
          if (result.error) {
            console.log('❌ Authentication failed:', result.error.message);
          } else {
            console.log('🎉 Wallet authentication successful!');
          }
        } catch (error) {
          console.log('💥 Exception during signInWithWallet:', error);
        } finally {
          setWalletConnecting(false);
        }
      };
      
      authenticateWallet();
    }
  }, [isConnected, address, signInWithWallet, walletConnecting, user]);

  const handleSignUp = async () => {
    if (!email || !password || !name) return;
    
    setIsLoading(true);
    await signUp(email, password, { 
      username: name.toLowerCase().replace(/\s+/g, ''),
      display_name: name 
    });
    setIsLoading(false);
  };

  const handleSignIn = async () => {
    if (!email || !password) return;
    
    setIsLoading(true);
    await signIn(email, password);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface-elevated to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to <span className="text-primary">AURA</span></h1>
          <p className="text-muted-foreground">Where digital art meets emotion</p>
        </div>

        <Card className="border-border/50 bg-surface-elevated/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Join the community</CardTitle>
            <CardDescription>
              Discover NFTs that match your vibe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signup" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="login">Sign In</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  variant="aura" 
                  size="lg"
                  onClick={handleSignUp}
                  disabled={isLoading || !email || !password || !name}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </TabsContent>
              
              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Button 
                  className="w-full" 
                  variant="aura" 
                  size="lg"
                  onClick={handleSignIn}
                  disabled={isLoading || !email || !password}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </TabsContent>
            </Tabs>

            <div className="relative my-6">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-surface-elevated px-2 text-xs text-muted-foreground">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  console.log('🔌 Clearing wallet cache before MetaMask connection');
                  // Clear signout flags for legitimate connection
                  localStorage.removeItem('signout-in-progress');
                  sessionStorage.removeItem('signout-in-progress');
                  // Clear wallet cache before connecting
                  localStorage.removeItem('wagmi.store');
                  localStorage.removeItem('wagmi.cache');
                  localStorage.removeItem('wagmi.recentConnectorId');
                  
                  console.log('Available connectors:', connectors.map(c => c.name));
                  const metamaskConnector = connectors.find(c => c.name.toLowerCase().includes('metamask'));
                  if (metamaskConnector) {
                    console.log('Connecting to MetaMask...');
                    connect({ connector: metamaskConnector });
                  } else {
                    console.log('MetaMask connector not found');
                  }
                }}
                disabled={isPending}
              >
                <Wallet className="w-4 h-4 mr-2" />
                MetaMask
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  console.log('🔌 Clearing wallet cache before WalletConnect');
                  // Clear signout flags for legitimate connection
                  localStorage.removeItem('signout-in-progress');
                  sessionStorage.removeItem('signout-in-progress');
                  // Clear wallet cache before connecting
                  localStorage.removeItem('wagmi.store');
                  localStorage.removeItem('wagmi.cache');
                  localStorage.removeItem('wagmi.recentConnectorId');
                  localStorage.removeItem('walletconnect');
                  
                  console.log('Available connectors:', connectors.map(c => c.name));
                  const walletConnectConnector = connectors.find(c => c.name.toLowerCase().includes('walletconnect'));
                  if (walletConnectConnector) {
                    console.log('Connecting to WalletConnect...');
                    connect({ connector: walletConnectConnector });
                  } else {
                    console.log('WalletConnect connector not found');
                  }
                }}
                disabled={isPending}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Trust/Other
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={async () => {
                console.log('🔌 Forcing fresh Coinbase connection...');
                
                // Disconnect current wallet first if connected
                if (isConnected) {
                  console.log('🔌 Disconnecting current wallet...');
                  disconnect();
                  await new Promise(resolve => setTimeout(resolve, 500)); // Wait for disconnect
                }
                
                // Clear signout flags for legitimate connection
                localStorage.removeItem('signout-in-progress');
                sessionStorage.removeItem('signout-in-progress');
                
                // Clear ALL wallet-related storage
                const keysToRemove = [
                  'wagmi.store',
                  'wagmi.cache', 
                  'wagmi.recentConnectorId',
                  'wagmi.wallet',
                  'wagmi.connected',
                  'coinbaseWallet',
                  'walletconnect',
                  'ethereum'
                ];
                
                keysToRemove.forEach(key => {
                  localStorage.removeItem(key);
                  sessionStorage.removeItem(key);
                });
                
                console.log('🧹 Cleared all wallet storage for fresh connection');
                
                // Find and connect to Coinbase 
                console.log('Available connectors:', connectors.map(c => c.name));
                const coinbaseConnector = connectors.find(c => c.name.toLowerCase().includes('coinbase'));
                if (coinbaseConnector) {
                  console.log('🚀 Connecting to fresh Coinbase wallet...');
                  connect({ connector: coinbaseConnector });
                } else {
                  console.log('❌ Coinbase connector not found');
                }
              }}
              disabled={isPending}
            >
              <img src="/lovable-uploads/65335d63-736a-4858-93e6-bbfbb2af42ff.png" alt="Base" className="w-4 h-4 mr-2" />
              Coinbase Wallet
            </Button>
            
            {isConnected && address && (
              <div className="mt-4 p-3 bg-surface-elevated rounded-md">
                <p className="text-sm text-center mb-3">
                  <span className="text-muted-foreground">Connected: </span>
                  <span className="font-mono text-primary">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      if (!user && address) {
                        setWalletConnecting(true);
                        try {
                          const result = await signInWithWallet(address);
                          console.log('🔄 Manual authentication result:', result);
                        } catch (error) {
                          console.log('💥 Manual authentication error:', error);
                        } finally {
                          setWalletConnecting(false);
                        }
                      }
                    }}
                    disabled={walletConnecting || !!user}
                  >
                    {walletConnecting ? "Auth..." : "Sign In"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      console.log('🔌 Disconnecting wallet and signing out...');
                      try {
                        // Sign out from Supabase first
                        if (user) {
                          await signOut();
                        }
                        // Disconnect wallet
                        disconnect();
                        setWalletConnecting(false);
                        // Clear any cached wallet state
                        localStorage.removeItem('walletconnect');
                        localStorage.removeItem('wagmi.store');
                        localStorage.removeItem('wagmi.cache');
                        console.log('✅ Wallet and auth disconnected successfully');
                      } catch (error) {
                        console.error('❌ Error during disconnect:', error);
                      }
                    }}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground mt-6">
              By continuing, you agree to our{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
