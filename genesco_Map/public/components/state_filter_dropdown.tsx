import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SiteLocation } from '../lib/types';
import { normalizeUsState, US_STATES, UsStateName } from '../lib/us_states';

interface StateFilterDropdownProps {
  selectedState: UsStateName | null;
  sites: Pick<SiteLocation, 'state'>[];
  onChange: (state: UsStateName | null) => void;
}

export const StateFilterDropdown = ({
  selectedState,
  sites,
  onChange,
}: StateFilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const counts = useMemo(() => {
    const stateCounts = new Map<UsStateName, number>(US_STATES.map(({ name }) => [name, 0]));
    sites.forEach(({ state }) => {
      const stateName = normalizeUsState(state);
      if (stateName) stateCounts.set(stateName, (stateCounts.get(stateName) || 0) + 1);
    });
    return stateCounts;
  }, [sites]);

  const filteredStates = useMemo(() => {
    const term = search.trim().toLowerCase();
    return US_STATES.filter(
      ({ code, name }) =>
        term === '' || name.toLowerCase().includes(term) || code.toLowerCase().includes(term)
    );
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

  const selectState = (state: UsStateName | null) => {
    onChange(state);
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div id="state-filter-panel" ref={dropdownRef}>
      <div id="state-filter-title">Filter by State</div>
      <button
        className="state-filter-trigger"
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="state-filter-trigger-label">{selectedState || 'All States'}</span>
        <span className="state-filter-chevron" aria-hidden="true">
          {isOpen ? '▴' : '▾'}
        </span>
      </button>
      {isOpen && (
        <div className="state-filter-menu">
          <input
            className="state-filter-search"
            type="search"
            aria-label="Search states"
            placeholder="Search states..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="state-filter-options" role="listbox" aria-label="US states">
            <button
              className={`state-filter-option${selectedState === null ? ' selected' : ''}`}
              type="button"
              role="option"
              aria-selected={selectedState === null}
              onClick={() => selectState(null)}
            >
              <span>All States</span>
              <span className="state-filter-count">{sites.length}</span>
            </button>
            {filteredStates.map(({ code, name }) => (
              <button
                key={code}
                className={`state-filter-option${selectedState === name ? ' selected' : ''}`}
                type="button"
                role="option"
                aria-selected={selectedState === name}
                onClick={() => selectState(name)}
              >
                <span>{name}</span>
                <span className="state-filter-count">{counts.get(name) || 0}</span>
              </button>
            ))}
            {filteredStates.length === 0 && (
              <div className="state-filter-empty">No states found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
