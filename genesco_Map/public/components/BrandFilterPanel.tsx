import React from 'react';
import { BRAND_SHORTCUTS, BRANDS, BrandCode } from '../lib/brands';

interface BrandFilterPanelProps {
  selectedBrands: ReadonlySet<BrandCode>;
  counts: ReadonlyMap<BrandCode, number>;
  onChange: (brands: Set<BrandCode>) => void;
}

export const BrandFilterPanel = ({ selectedBrands, counts, onChange }: BrandFilterPanelProps) => (
  <div id="brand-filter-panel">
    <div id="brand-filter-title">Filter by Brand</div>
    <div className="brand-filter-buttons">
      {BRANDS.map(({ code, label }) => {
        const active = selectedBrands.has(code);
        return (
          <button
            key={code}
            className={`brand-filter-pill${active ? ' selected' : ''}`}
            type="button"
            aria-pressed={active}
            onClick={() => {
              const nextSelectedBrands = new Set(selectedBrands);
              if (active) {
                nextSelectedBrands.delete(code);
              } else {
                nextSelectedBrands.add(code);
              }
              onChange(nextSelectedBrands);
            }}
          >
            <span className="brand-shortcut">{BRAND_SHORTCUTS[code]}</span>
            <span className="brand-code">{code}</span>
            <span className="brand-label">{label}</span>
            <span className="f-cnt">{counts.get(code) ?? 0}</span>
          </button>
        );
      })}
    </div>
  </div>
);
