'use client';

import { useState } from 'react';

interface SearchButtonProps {
  onClick: () => void;
}

export default function SearchButton({ onClick }: SearchButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 group"
      aria-label="搜索"
    >
      <svg
        className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </button>
  );
}
