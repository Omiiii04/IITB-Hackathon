import React from 'react';

export interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className, children }: SkeletonProps) {
  return <div className={className}>{children}</div>;
}

export default Skeleton;
