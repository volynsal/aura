import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Star, Users, Crown, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price_eth: number;
  price_usd: number;
  benefits: string[];
  max_subscribers: number;
  subscriber_count: number;
  is_active: boolean;
}

interface SubscriptionTiersProps {
  creatorId?: string;
  isOwner?: boolean;
}

export default function SubscriptionTiers({ creatorId, isOwner = false }: SubscriptionTiersProps) {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTier, setNewTier] = useState({
    name: '',
    description: '',
    price_eth: '',
    price_usd: '',
    benefits: [''],
    max_subscribers: ''
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (creatorId || user) {
      fetchTiers();
    }
  }, [creatorId, user]);

  const fetchTiers = async () => {
    try {
      const targetCreatorId = creatorId || user?.id;
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*, subscriptions(count)')
        .eq('creator_id', targetCreatorId)
        .eq('is_active', true);

      if (error) throw error;

      const tiersWithCounts = data?.map(tier => ({
        ...tier,
        subscriber_count: tier.subscriptions?.[0]?.count || 0
      })) || [];

      setTiers(tiersWithCounts);
    } catch (error: any) {
      toast({
        title: "Error loading tiers",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addBenefit = () => {
    setNewTier(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }));
  };

  const updateBenefit = (index: number, value: string) => {
    setNewTier(prev => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) => i === index ? value : benefit)
    }));
  };

  const removeBenefit = (index: number) => {
    setNewTier(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const createTier = async () => {
    if (!user || !newTier.name || !newTier.price_eth) return;

    setIsCreating(true);

    try {
      const { error } = await supabase
        .from('subscription_tiers')
        .insert({
          creator_id: user.id,
          name: newTier.name,
          description: newTier.description,
          price_eth: parseFloat(newTier.price_eth),
          price_usd: newTier.price_usd ? parseFloat(newTier.price_usd) : null,
          benefits: newTier.benefits.filter(b => b.trim()),
          max_subscribers: newTier.max_subscribers ? parseInt(newTier.max_subscribers) : null
        });

      if (error) throw error;

      toast({
        title: "Tier created!",
        description: "Your subscription tier has been created successfully."
      });

      setNewTier({
        name: '',
        description: '',
        price_eth: '',
        price_usd: '',
        benefits: [''],
        max_subscribers: ''
      });

      fetchTiers();
    } catch (error: any) {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const subscribe = async (tierId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          subscriber_id: user.id,
          tier_id: tierId,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        });

      if (error) throw error;

      toast({
        title: "Subscribed!",
        description: "You've successfully subscribed to this tier."
      });

      fetchTiers();
    } catch (error: any) {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getTierIcon = (index: number) => {
    const icons = [Star, Zap, Crown];
    const Icon = icons[index % icons.length];
    return <Icon className="h-5 w-5" />;
  };

  const getTierColor = (index: number) => {
    const colors = ['text-yellow-500', 'text-purple-500', 'text-blue-500'];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {isOwner ? 'Manage Subscription Tiers' : 'Support This Creator'}
        </h2>
        {isOwner && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="aura">
                <Plus className="h-4 w-4 mr-2" />
                Create Tier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Subscription Tier</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tier-name">Tier Name</Label>
                  <Input
                    id="tier-name"
                    placeholder="e.g., Premium Access"
                    value={newTier.name}
                    onChange={(e) => setNewTier(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tier-description">Description</Label>
                  <Textarea
                    id="tier-description"
                    placeholder="Describe what subscribers get..."
                    value={newTier.description}
                    onChange={(e) => setNewTier(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="tier-price-eth">Price (ETH)</Label>
                    <Input
                      id="tier-price-eth"
                      type="number"
                      step="0.001"
                      placeholder="0.01"
                      value={newTier.price_eth}
                      onChange={(e) => setNewTier(prev => ({ ...prev, price_eth: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tier-price-usd">Price (USD)</Label>
                    <Input
                      id="tier-price-usd"
                      type="number"
                      step="0.01"
                      placeholder="25.00"
                      value={newTier.price_usd}
                      onChange={(e) => setNewTier(prev => ({ ...prev, price_usd: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Benefits</Label>
                  {newTier.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Enter benefit..."
                        value={benefit}
                        onChange={(e) => updateBenefit(index, e.target.value)}
                      />
                      {newTier.benefits.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBenefit(index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addBenefit}>
                    Add Benefit
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-subscribers">Max Subscribers (optional)</Label>
                  <Input
                    id="max-subscribers"
                    type="number"
                    placeholder="100"
                    value={newTier.max_subscribers}
                    onChange={(e) => setNewTier(prev => ({ ...prev, max_subscribers: e.target.value }))}
                  />
                </div>

                <Button
                  onClick={createTier}
                  disabled={isCreating || !newTier.name || !newTier.price_eth}
                  className="w-full"
                  variant="aura"
                >
                  {isCreating ? 'Creating...' : 'Create Tier'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiers.map((tier, index) => (
          <Card key={tier.id} className="relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-2 ${getTierColor(index)}`}>
              {getTierIcon(index)}
            </div>
            
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {tier.name}
                <Badge variant="outline">
                  {tier.subscriber_count}/{tier.max_subscribers || '∞'}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">{tier.description}</p>
              
              <div className="text-center">
                <div className="text-2xl font-bold">{tier.price_eth} ETH</div>
                {tier.price_usd && (
                  <div className="text-sm text-muted-foreground">${tier.price_usd} USD</div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Benefits:</h4>
                <ul className="space-y-1">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {!isOwner && (
                <Button
                  onClick={() => subscribe(tier.id)}
                  className="w-full"
                  variant="aura"
                  disabled={tier.max_subscribers && tier.subscriber_count >= tier.max_subscribers}
                >
                  {tier.max_subscribers && tier.subscriber_count >= tier.max_subscribers
                    ? 'Tier Full'
                    : 'Subscribe'
                  }
                </Button>
              )}

              {isOwner && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  {tier.subscriber_count} subscribers
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {tiers.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">
            {isOwner ? 'No tiers created yet' : 'No subscription tiers available'}
          </h3>
          <p className="text-muted-foreground">
            {isOwner 
              ? 'Create your first subscription tier to start earning from your community.'
              : 'This creator hasn\'t set up subscription tiers yet.'
            }
          </p>
        </div>
      )}
    </div>
  );
}