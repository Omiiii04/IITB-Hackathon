import React from 'react';

export interface SidebarProps {
  className?: string;
  children?: React.ReactNode;
}

export function Sidebar({ className, children }: SidebarProps) {
  return <div className={className}>{children}</div>;
}

export default Sidebar;
