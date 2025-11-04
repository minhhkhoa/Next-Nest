import type { ReactNode } from "react";

interface NewsLayoutProps {
  children: ReactNode;
}

export function NewsLayout({ children }: NewsLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
