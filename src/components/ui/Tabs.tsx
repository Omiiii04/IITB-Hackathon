import React from 'react';

export interface Tab {
  label: string;
  value: string;
}

export interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className = '' }: TabsProps) {
  return (
    <div className={`flex gap-2 border-b border-primary-50 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-3 py-2 text-sm font-medium ${
            active === tab.value
              ? 'border-b-2 border-primary-500 text-primary-900'
              : 'text-primary-500'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default Tabs;