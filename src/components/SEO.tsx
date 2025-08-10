import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  structuredData?: object;
}

const SITE_URL = typeof window !== "undefined" ? window.location.origin : "";

export function SEO({ title, description, path = "/", image, structuredData }: SEOProps) {
  const url = SITE_URL ? `${SITE_URL}${path}` : path;
  const defaultImage = "/src/assets/aura-logo.png";
  
  // For NFT pages, use a specific social sharing approach
  const isNFTPage = path.startsWith('/nft/');
  let finalImage = image || defaultImage;
  
  // If it's an NFT page and we have an image, use it directly
  if (isNFTPage && image) {
    finalImage = image;
  }
  
  const imageUrl = finalImage?.startsWith("http") ? finalImage : (SITE_URL ? `${SITE_URL}${finalImage}` : finalImage);
  
  // Debug logging
  console.log("SEO Component - Title:", title);
  console.log("SEO Component - Final Image URL:", imageUrl);
  console.log("SEO Component - Original Image:", image);
  
  // Determine image type for better social media compatibility
  const getImageType = (url: string) => {
    if (url.includes('.gif')) return 'image/gif';
    if (url.includes('.png')) return 'image/png';
    if (url.includes('.jpg') || url.includes('.jpeg')) return 'image/jpeg';
    return 'image/jpeg'; // default
  };

  return (
    <Helmet>
      <title>{title}</title>
      <link rel="canonical" href={url} />
      <meta name="description" content={description} />

      {/* Open Graph tags */}
      <meta property="og:title" content={title} />
      <meta property="og:site_name" content="Aura" />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:secure_url" content={imageUrl} />
      <meta property="og:image:type" content={getImageType(imageUrl)} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

export default SEO;
