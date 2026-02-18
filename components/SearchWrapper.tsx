'use client';

import { useState } from 'react';
import SearchButton from '@/components/SearchButton';
import SearchModal from '@/components/SearchModal';

export default function SearchWrapper() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  return (
    <>
      <SearchButton onClick={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
