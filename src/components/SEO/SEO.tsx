import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type StructuredData = Record<string, unknown>;

interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: string;
  ogImage?: string;
  twitterImage?: string;
  imageAlt?: string;
  robots?: string;
  keywords?: string;
  structuredData?: StructuredData | StructuredData[];
}

const SITE_URL = "https://sqlforfiles.app";
const SITE_NAME = "SQL for Files";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_TWITTER_IMAGE = `${SITE_URL}/twitter-image.png`;

const resolveUrl = (path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path === "/") {
    return `${SITE_URL}/`;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized.replace(/\/$/, "")}`;
};

export default function SEO({
  title,
  description,
  canonicalPath,
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  twitterImage = DEFAULT_TWITTER_IMAGE,
  imageAlt,
  robots = "index,follow",
  keywords,
  structuredData,
}: SEOProps) {
  const location = useLocation();
  const canonical = resolveUrl(canonicalPath ?? location.pathname);
  const ogImageUrl = resolveUrl(ogImage);
  const twitterImageUrl = resolveUrl(twitterImage);
  const metaImageAlt = imageAlt ?? `${title} - ${SITE_NAME}`;
  const structuredDataItems = Array.isArray(structuredData)
    ? structuredData
    : structuredData
      ? [structuredData]
      : [];

  useEffect(() => {
    const head = document.head;
    const previous = head.querySelectorAll("[data-seo='true']");

    previous.forEach((node) => node.remove());
    document.title = title;

    const metaTags = [
      { name: "title", content: title },
      { name: "description", content: description },
      { name: "robots", content: robots },
      ...(keywords ? [{ name: "keywords", content: keywords }] : []),
    ];

    const propertyTags = [
      { property: "og:type", content: ogType },
      { property: "og:url", content: canonical },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: ogImageUrl },
      { property: "og:image:width", content: "2400" },
      { property: "og:image:height", content: "1260" },
      { property: "og:image:alt", content: metaImageAlt },
      { property: "og:site_name", content: SITE_NAME },
      { property: "twitter:card", content: "summary_large_image" },
      { property: "twitter:url", content: canonical },
      { property: "twitter:title", content: title },
      { property: "twitter:description", content: description },
      { property: "twitter:image", content: twitterImageUrl },
      { property: "twitter:image:alt", content: metaImageAlt },
    ];

    metaTags.forEach(({ name, content }) => {
      const meta = document.createElement("meta");
      meta.setAttribute("name", name);
      meta.setAttribute("content", content);
      meta.setAttribute("data-seo", "true");
      head.appendChild(meta);
    });

    propertyTags.forEach(({ property, content }) => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", property);
      meta.setAttribute("content", content);
      meta.setAttribute("data-seo", "true");
      head.appendChild(meta);
    });

    const canonicalLink = document.createElement("link");
    canonicalLink.setAttribute("rel", "canonical");
    canonicalLink.setAttribute("href", canonical);
    canonicalLink.setAttribute("data-seo", "true");
    head.appendChild(canonicalLink);

    structuredDataItems.forEach((item) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(item);
      script.setAttribute("data-seo", "true");
      head.appendChild(script);
    });
  }, [
    canonical,
    description,
    keywords,
    metaImageAlt,
    ogImageUrl,
    ogType,
    robots,
    structuredDataItems,
    title,
    twitterImageUrl,
  ]);

  return null;
}
