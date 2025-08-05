import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NFTUploadProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function NFTUpload({ onClose, onSuccess }: NFTUploadProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceEth, setPriceEth] = useState('');
  const [priceUsd, setPriceUsd] = useState('');
  const [rarity, setRarity] = useState('');
  const [isExclusive, setIsExclusive] = useState(false);
  const [attributes, setAttributes] = useState<Array<{trait_type: string, value: string}>>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });

  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: '', value: '' }]);
  };

  const updateAttribute = (index: number, field: 'trait_type' | 'value', value: string) => {
    const updated = attributes.map((attr, i) => 
      i === index ? { ...attr, [field]: value } : attr
    );
    setAttributes(updated);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('nft-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('nft-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!user || !imageFile || !title) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields and upload an image.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload image
      const imageUrl = await uploadImage(imageFile);

      // Create NFT record
      const { error: nftError } = await supabase
        .from('nfts')
        .insert({
          creator_id: user.id,
          title,
          description,
          image_url: imageUrl,
          price_eth: priceEth ? parseFloat(priceEth) : null,
          price_usd: priceUsd ? parseFloat(priceUsd) : null,
          rarity,
          is_exclusive: isExclusive,
          attributes: attributes.filter(attr => attr.trait_type && attr.value)
        });

      if (nftError) throw nftError;

      toast({
        title: "NFT uploaded successfully!",
        description: "Your NFT has been added to the platform."
      });

      // Reset form
      setTitle('');
      setDescription('');
      setPriceEth('');
      setPriceUsd('');
      setRarity('');
      setIsExclusive(false);
      setAttributes([]);
      setImageFile(null);
      setImagePreview(null);

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Upload New NFT
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Image *</Label>
          {!imagePreview ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Drop the image here' : 'Drag & drop your image here'}
              </p>
              <p className="text-sm text-muted-foreground">
                Or click to select a file • PNG, JPG, GIF up to 10MB
              </p>
            </div>
          ) : (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-64 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="NFT Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rarity">Rarity</Label>
            <Select value={rarity} onValueChange={setRarity}>
              <SelectTrigger>
                <SelectValue placeholder="Select rarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="uncommon">Uncommon</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your NFT..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price-eth">Price (ETH)</Label>
            <Input
              id="price-eth"
              type="number"
              step="0.001"
              placeholder="0.1"
              value={priceEth}
              onChange={(e) => setPriceEth(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price-usd">Price (USD)</Label>
            <Input
              id="price-usd"
              type="number"
              step="0.01"
              placeholder="100.00"
              value={priceUsd}
              onChange={(e) => setPriceUsd(e.target.value)}
            />
          </div>
        </div>

        {/* Attributes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Attributes</Label>
            <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
              <Plus className="h-4 w-4 mr-2" />
              Add Trait
            </Button>
          </div>
          
          {attributes.map((attr, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                placeholder="Trait type"
                value={attr.trait_type}
                onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
              />
              <Input
                placeholder="Value"
                value={attr.value}
                onChange={(e) => updateAttribute(index, 'value', e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeAttribute(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={isUploading || !imageFile || !title}
            className="flex-1"
            variant="aura"
          >
            {isUploading ? 'Uploading...' : 'Upload NFT'}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}