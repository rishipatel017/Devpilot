'use client';

import { ReactNode } from 'react';

interface ResponseCardProps {
  children: ReactNode;
  isLoading?: boolean;
}

export default function ResponseCard({ children, isLoading }: ResponseCardProps) {
  return (
    <div className="mt-6 backdrop-blur-xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl">
      {isLoading ? (
        <div className="p-6 flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <span className="text-gray-300 font-medium">Generating response...</span>
        </div>
      ) : (
        <div className="p-6 markdown-content max-w-none text-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}
