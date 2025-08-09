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
  const defaultImage = "/lovable-uploads/c01519dd-0698-4c23-b3a7-e5af5415a354.png";
  
  // For NFT pages, use a specific social sharing approach
  const isNFTPage = path.startsWith('/nft/');
  let finalImage = image || defaultImage;
  
  // If it's an NFT page and we have a gif, we might want to use a static version
  // For now, we'll use the original image but this could be enhanced
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

      {/* Open Graph tags - use key attribute to force replacement */}
      <meta key="og:title" property="og:title" content={title} />
      <meta key="og:site_name" property="og:site_name" content="Aura" />
      <meta key="og:description" property="og:description" content={description} />
      <meta key="og:type" property="og:type" content="article" />
      <meta key="og:url" property="og:url" content={url} />
      <meta key="og:image" property="og:image" content={imageUrl} />
      <meta key="og:image:secure_url" property="og:image:secure_url" content={imageUrl} />
      <meta key="og:image:type" property="og:image:type" content={getImageType(imageUrl)} />
      <meta key="og:image:width" property="og:image:width" content="1200" />
      <meta key="og:image:height" property="og:image:height" content="630" />

      {/* Twitter Card tags - use key attribute to force replacement */}
      <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
      <meta key="twitter:title" name="twitter:title" content={title} />
      <meta key="twitter:description" name="twitter:description" content={description} />
      <meta key="twitter:image" name="twitter:image" content={imageUrl} />

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

export default SEO;
