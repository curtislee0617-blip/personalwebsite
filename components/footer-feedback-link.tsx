"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function FooterFeedbackLink() {
  const pathname = usePathname();

  return <Link className="footer-link footer-feedback-link" href={`/recipes/feedback?from=${encodeURIComponent(pathname)}`}>Website error feedback</Link>;
}
