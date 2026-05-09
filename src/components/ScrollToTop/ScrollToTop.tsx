import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop Component
 *
 * Automatically scrolls the window when the route changes.
 * Hash links scroll to their target section; other route changes scroll to top.
 * This component doesn't render anything - it just handles the side effect.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const element = document.getElementById(id);

      if (element) {
        element.scrollIntoView();
        return;
      }
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
