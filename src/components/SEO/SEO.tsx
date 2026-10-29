import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

import { canonicalUrl, SITE_NAME, SITE_URL } from "../../utils/siteUrl";

type StructuredData = Record<string, unknown>;

interface SEOProps {
  title: string;
  description: string;
  /**
   * Path used for the canonical link and og:url. Defaults to the current path.
   * Pass `null` for pages that must not declare a canonical URL, such as 404 pages.
   */
  canonicalPath?: string | null;
  ogType?: string;
  ogImage?: string;
  twitterImage?: string;
  imageAlt?: string;
  robots?: string;
  keywords?: string;
  structuredData?: StructuredData | StructuredData[];
}

const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_TWITTER_IMAGE = `${SITE_URL}/twitter-image.png`;

/** SEO writes page metadata, canonical links, social tags, and JSON-LD into the document head. */
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
  const canonical =
    canonicalPath === null ? null : canonicalUrl(canonicalPath ?? location.pathname);
  const ogImageUrl = canonicalUrl(ogImage);
  const twitterImageUrl = canonicalUrl(twitterImage);
  const metaImageAlt = imageAlt ?? `${title} - ${SITE_NAME}`;
  const structuredDataItems = useMemo(
    () =>
      Array.isArray(structuredData)
        ? structuredData
        : structuredData
          ? [structuredData]
          : [],
    [structuredData]
  );

  useEffect(() => {
    const head = document.head;
    const previous = head.querySelectorAll("[data-seo='true']");

    previous.forEach((node) => node.remove());
    document.title = title;

    const metaTags = [
      { name: "description", content: description },
      { name: "robots", content: robots },
      ...(keywords ? [{ name: "keywords", content: keywords }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: twitterImageUrl },
      { name: "twitter:image:alt", content: metaImageAlt },
    ];

    const propertyTags = [
      { property: "og:type", content: ogType },
      ...(canonical ? [{ property: "og:url", content: canonical }] : []),
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: ogImageUrl },
      { property: "og:image:width", content: "2400" },
      { property: "og:image:height", content: "1260" },
      { property: "og:image:alt", content: metaImageAlt },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "en_US" },
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

    if (canonical) {
      const canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      canonicalLink.setAttribute("href", canonical);
      canonicalLink.setAttribute("data-seo", "true");
      head.appendChild(canonicalLink);
    }

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
