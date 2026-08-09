import React from 'react';

export interface FooterProps {
  className?: string;
  children?: React.ReactNode;
}

export function Footer({ className, children }: FooterProps) {
  return <div className={className}>{children}</div>;
}

export default Footer;
