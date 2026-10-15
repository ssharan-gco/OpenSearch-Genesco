import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => (
  <div className={`float ${value !== '' ? 'active' : ''}`} id="search-bar">
    <span id="search-icon">🔍</span>
    <span id="search-label">{value !== '' ? `Filtering "${value}"` : 'All Sites'}</span>
    <div id="search-input-wrap">
      <input
        type="text"
        id="store-search"
        placeholder="Site # or city"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value !== '' && (
        <button id="clear-search" onClick={() => onChange('')} title="Clear search">
          ✕
        </button>
      )}
    </div>
  </div>
);
