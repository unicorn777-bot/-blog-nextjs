'use client';

import { useState } from 'react';
import SearchModal from './SearchModal';
import SearchButton from './SearchButton';

export default function HeaderSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <SearchButton onClick={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
