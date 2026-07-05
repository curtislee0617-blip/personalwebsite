"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cursorCss, pageCursors } from "@/lib/page-cursors";

export function PageCursor() {
  const pathname = usePathname();
  // Lazy-init from the DOM (safe: this component renders null, so no hydration mismatch) and
  // then track the `dark` class so the theme-aware cursors update the moment the theme flips.
  const [isDark, setIsDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const el = document.documentElement;
    const observer = new MutationObserver(() => setIsDark(el.classList.contains("dark")));
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const match = pageCursors.find((entry) => entry.match(pathname));
    document.body.style.cursor = match ? cursorCss(match, isDark) : "";
    document.body.classList.toggle("has-page-cursor", Boolean(match));
    return () => {
      document.body.style.cursor = "";
      document.body.classList.remove("has-page-cursor");
    };
  }, [pathname, isDark]);

  return null;
}
