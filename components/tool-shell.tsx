'use client';

import { ReactNode } from 'react';

interface ToolShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function ToolShell({ title, description, children }: ToolShellProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">{title}</h1>
        <p className="text-gray-300 text-lg leading-relaxed">{description}</p>
      </div>
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 shadow-2xl">
        {children}
      </div>
    </div>
  );
}
