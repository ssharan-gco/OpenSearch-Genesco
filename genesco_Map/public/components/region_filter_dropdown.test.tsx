import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { RegionFilterDropdown } from './region_filter_dropdown';

const sites = [{ state: 'CA' }, { state: 'WA' }, { state: 'TX' }];

describe('RegionFilterDropdown', () => {
  it('searches and selects a region', () => {
    const onChange = jest.fn();
    render(<RegionFilterDropdown selectedRegion={null} sites={sites} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /all regions/i }));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search regions' }), {
      target: { value: 'south central' },
    });

    expect(screen.getByRole('option', { name: /South Central\s+1/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /^West/ })).toBeNull();

    fireEvent.click(screen.getByRole('option', { name: /South Central/ }));
    expect(onChange).toHaveBeenCalledWith('South Central');
    expect(screen.queryByRole('listbox', { name: 'US regions' })).toBeNull();
  });

  it('can clear the selected region by choosing all regions', () => {
    const onChange = jest.fn();
    render(<RegionFilterDropdown selectedRegion="West" sites={sites} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /West/i }));
    fireEvent.click(screen.getByRole('option', { name: /All Regions\s+3/ }));

    expect(onChange).toHaveBeenCalledWith(null);
  });
});
