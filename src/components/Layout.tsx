import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className = "" }: LayoutProps) {
  return (
    <div className={`min-h-screen bg-black ${className}`}>
      {children}
    </div>
  );
}

export function StaffLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  );
}