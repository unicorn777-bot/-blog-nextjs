'use client';

interface SearchButtonProps {
  onClick: () => void;
}

export default function SearchButton({ onClick }: SearchButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-center transition-all duration-300 hover:border-[var(--neon-green)] hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] group"
      aria-label="搜索"
    >
      <svg 
        className="w-5 h-5 text-[var(--text-secondary)] transition-colors group-hover:text-[var(--neon-green)]" 
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