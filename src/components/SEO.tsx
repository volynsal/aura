import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  structuredData?: object;
}

const SITE_URL = typeof window !== "undefined" ? window.location.origin : "";

export function SEO({ title, description, path = "/", image = "/lovable-uploads/c01519dd-0698-4c23-b3a7-e5af5415a354.png", structuredData }: SEOProps) {
  const url = SITE_URL ? `${SITE_URL}${path}` : path;
  const imageUrl = image?.startsWith("http") ? image : (SITE_URL ? `${SITE_URL}${image}` : image);

  return (
    <Helmet>
      <title>{title}</title>
      <link rel="canonical" href={url} />
      <meta name="description" content={description} />

      <meta property="og:title" content={title} />
      <meta property="og:site_name" content="Aura" />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

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
