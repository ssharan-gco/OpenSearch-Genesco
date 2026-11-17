import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SiteLocation } from '../lib/types';
import { getUsStateRegion, US_REGIONS, UsRegionName } from '../lib/us_regions';

interface RegionFilterDropdownProps {
  selectedRegion: UsRegionName | null;
  sites: Pick<SiteLocation, 'state'>[];
  onChange: (region: UsRegionName | null) => void;
}

export const RegionFilterDropdown = ({
  selectedRegion,
  sites,
  onChange,
}: RegionFilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const counts = useMemo(() => {
    const regionCounts = new Map<UsRegionName, number>(US_REGIONS.map((region) => [region, 0]));
    sites.forEach(({ state }) => {
      const region = getUsStateRegion(state);
      if (region) regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
    });
    return regionCounts;
  }, [sites]);

  const filteredRegions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return US_REGIONS.filter((region) => region.toLowerCase().includes(term));
  }, [search]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const selectRegion = (region: UsRegionName | null) => {
    onChange(region);
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div id="region-filter-panel" ref={dropdownRef}>
      <div id="region-filter-title">Filter by Region</div>
      <button
        className="state-filter-trigger"
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="state-filter-trigger-label">{selectedRegion || 'All Regions'}</span>
        <span className="state-filter-chevron" aria-hidden="true">
          {isOpen ? '▴' : '▾'}
        </span>
      </button>
      {isOpen && (
        <div className="state-filter-menu">
          <input
            className="state-filter-search"
            type="search"
            aria-label="Search regions"
            placeholder="Search regions..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="state-filter-options" role="listbox" aria-label="US regions">
            <button
              className={`state-filter-option${selectedRegion === null ? ' selected' : ''}`}
              type="button"
              role="option"
              aria-selected={selectedRegion === null}
              onClick={() => selectRegion(null)}
            >
              <span>All Regions</span>
              <span className="state-filter-count">{sites.length}</span>
            </button>
            {filteredRegions.map((region) => (
              <button
                key={region}
                className={`state-filter-option${selectedRegion === region ? ' selected' : ''}`}
                type="button"
                role="option"
                aria-selected={selectedRegion === region}
                onClick={() => selectRegion(region)}
              >
                <span>{region}</span>
                <span className="state-filter-count">{counts.get(region) || 0}</span>
              </button>
            ))}
            {filteredRegions.length === 0 && (
              <div className="state-filter-empty">No regions found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
