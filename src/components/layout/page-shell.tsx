import { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

export function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <div className={`container mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12 ${className}`}>
      {children}
    </div>
  );
}

