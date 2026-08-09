import React from 'react';

export interface NavbarProps {
  className?: string;
  children?: React.ReactNode;
}

export function Navbar({ className, children }: NavbarProps) {
  return <div className={className}>{children}</div>;
}

export default Navbar;
