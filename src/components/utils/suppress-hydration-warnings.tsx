'use client';

import { useEffect, useState, ReactNode } from 'react';

type SuppressHydrationWarningsProps = {
  children: ReactNode;
};

/**
 * A component that suppresses hydration warnings by rendering children only after
 * the component has mounted on the client side, preventing hydration mismatches
 * caused by browser extensions (like Bitdefender) that add attributes to the DOM.
 */
export default function SuppressHydrationWarnings({ children }: SuppressHydrationWarningsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and first render, don't render children to avoid hydration errors
  if (!mounted) {
    return <div suppressHydrationWarning />;
  }

  return <div suppressHydrationWarning>{children}</div>;
} 