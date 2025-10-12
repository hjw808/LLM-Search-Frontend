"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
  isTransitioning: boolean;
}

export function PageTransition({ children, isTransitioning }: PageTransitionProps) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    if (isTransitioning) {
      // Delay updating children until fade-out completes
      const timer = setTimeout(() => {
        setDisplayChildren(children);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children, isTransitioning]);

  return (
    <div
      className={`transition-opacity duration-100 ease-in-out ${
        isTransitioning ? "opacity-0" : "opacity-100"
      }`}
    >
      {displayChildren}
    </div>
  );
}
