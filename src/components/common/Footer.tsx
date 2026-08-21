import React from 'react';

export interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`border-t border-primary-50 bg-surface-light px-6 py-4 text-xs text-primary-500 ${className}`}>
      <span>© {new Date().getFullYear()} FlexHub. All rights reserved.</span>
    </footer>
  );
}

export default Footer;