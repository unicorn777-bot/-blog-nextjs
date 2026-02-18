'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  // 简单的淡入效果
  if (isFirstRender) {
    return <>{children}</>;
  }

  return (
    <div
      key={pathname + (searchParams?.toString() || '')}
      className="animate-fadeIn"
    >
      {children}
    </div>
  );
}