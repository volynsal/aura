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
import { useAccount, useConnect } from 'wagmi';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [walletConnecting, setWalletConnecting] = useState(false);
  
  const { signUp, signIn, signInWithWallet, user } = useAuth();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Auto-authenticate when wallet connects with debouncing
  useEffect(() => {
    console.log('Wallet connection state:', { isConnected, address, walletConnecting, user });
    
    if (isConnected && address && !walletConnecting && !user) {
      console.log('Starting wallet authentication for:', address);
      setWalletConnecting(true);
      
      const timeoutId = setTimeout(async () => {
        console.log('Executing signInWithWallet for:', address);
        const result = await signInWithWallet(address);
        console.log('signInWithWallet result:', result);
        
        // Stop trying if rate limited
        if (result.error?.message?.includes('rate limit')) {
          console.log('Rate limited, stopping wallet authentication attempts');
        }
        
        setWalletConnecting(false);
      }, 1000); // 1 second delay to prevent rapid calls

      return () => clearTimeout(timeoutId);
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
              className="w-full mt-3"
              onClick={() => {
                console.log('Available connectors:', connectors.map(c => c.name));
                const coinbaseConnector = connectors.find(c => c.name.toLowerCase().includes('coinbase'));
                if (coinbaseConnector) {
                  console.log('Connecting to Coinbase...');
                  connect({ connector: coinbaseConnector });
                } else {
                  console.log('Coinbase connector not found');
                }
              }}
              disabled={isPending}
            >
              <img src="/lovable-uploads/65335d63-736a-4858-93e6-bbfbb2af42ff.png" alt="Base" className="w-4 h-4 mr-2" />
              Coinbase Wallet
            </Button>
            
            {isConnected && address && (
              <div className="mt-4 p-3 bg-surface-elevated rounded-md">
                <p className="text-sm text-center">
                  <span className="text-muted-foreground">Connected: </span>
                  <span className="font-mono text-primary">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                </p>
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
