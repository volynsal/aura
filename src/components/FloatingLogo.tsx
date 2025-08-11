import { useState, useEffect } from 'react';
import { removeBackground, loadImageFromUrl } from '@/lib/backgroundRemoval';

interface FloatingLogoProps {
  src: string;
  alt: string;
  className?: string;
}

const FloatingLogo = ({ src, alt, className }: FloatingLogoProps) => {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processLogo = async () => {
      try {
        setIsProcessing(true);
        setError(null);
        
        // Load the original image
        const img = await loadImageFromUrl(src);
        
        // Remove background
        const processedBlob = await removeBackground(img);
        
        // Create URL for the processed image
        const url = URL.createObjectURL(processedBlob);
        setProcessedImageUrl(url);
        
      } catch (err) {
        console.error('Failed to process logo:', err);
        setError('Failed to process logo');
      } finally {
        setIsProcessing(false);
      }
    };

    processLogo();

    // Cleanup URL when component unmounts
    return () => {
      if (processedImageUrl) {
        URL.revokeObjectURL(processedImageUrl);
      }
    };
  }, [src]);

  // Show original image while processing or if there's an error
  if (isProcessing || error || !processedImageUrl) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={className}
      />
    );
  }

  return (
    <img 
      src={processedImageUrl} 
      alt={alt} 
      className={className}
      style={{
        filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))'
      }}
    />
  );
};

export default FloatingLogo;