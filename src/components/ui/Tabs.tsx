import React from 'react';

export interface TabsProps {
  className?: string;
  children?: React.ReactNode;
}

export function Tabs({ className, children }: TabsProps) {
  return <div className={className}>{children}</div>;
}

export default Tabs;
