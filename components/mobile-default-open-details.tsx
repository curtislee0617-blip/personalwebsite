"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";

type MobileDefaultOpenDetailsProps = ComponentPropsWithoutRef<"details">;

export function MobileDefaultOpenDetails({
  children,
  ...props
}: MobileDefaultOpenDetailsProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (window.matchMedia("(max-width: 640px)").matches && detailsRef.current) {
      detailsRef.current.open = true;
    }
  }, []);

  return (
    <details ref={detailsRef} {...props}>
      {children}
    </details>
  );
}
