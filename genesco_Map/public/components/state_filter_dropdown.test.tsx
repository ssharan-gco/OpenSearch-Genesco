import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { StateFilterDropdown } from './state_filter_dropdown';

const sites = [
  { state: 'CA' },
  { state: 'California' },
  { state: 'NY' },
];

describe('StateFilterDropdown', () => {
  it('searches states by name and abbreviation and selects a state', () => {
    const onChange = jest.fn();
    render(
      <StateFilterDropdown
        selectedState={null}
        selectedRegion={null}
        sites={sites}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /all states/i }));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search states' }), {
      target: { value: 'ny' },
    });

    expect(screen.getByRole('option', { name: /New York\s+1/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /California/ })).toBeNull();

    fireEvent.click(screen.getByRole('option', { name: /New York/ }));

    expect(onChange).toHaveBeenCalledWith('New York');
    expect(screen.queryByRole('listbox', { name: 'US states' })).toBeNull();
  });

  it('can clear the selected state by choosing all states', () => {
    const onChange = jest.fn();
    render(
      <StateFilterDropdown
        selectedState="California"
        selectedRegion={null}
        sites={sites}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /California/i }));
    fireEvent.click(screen.getByRole('option', { name: /All States\s+3/ }));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('limits state choices and counts to the selected region', () => {
    render(
      <StateFilterDropdown
        selectedState={null}
        selectedRegion="West"
        sites={sites}
        onChange={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /all states/i }));

    expect(screen.getByRole('option', { name: /All States\s+2/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /California\s+2/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /New York/ })).toBeNull();
  });
});
