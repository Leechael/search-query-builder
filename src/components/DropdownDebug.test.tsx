import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchQueryBuilder } from './SearchQueryBuilder';
import { FilterKey } from '@/types';

const mockFilterKeys: FilterKey[] = [
  {
    key: 'browser.name',
    name: 'Browser Name', 
    kind: 'field',
    valueType: 'string',
    allowedOperators: ['=', '!='],
  },
];

describe('Dropdown Debug', () => {
  it('should debug the dropdown rendering condition step by step', async () => {
    const user = userEvent.setup();
    
    render(
      <SearchQueryBuilder
        query=""
        onChange={() => {}}
        onSearch={() => {}}
        filterKeys={mockFilterKeys}
      />
    );

    const input = screen.getByTestId('inter-token-input-0');
    
    // Step 1: Check input exists
    expect(input).toBeInTheDocument();
    
    // Step 2: Focus the input
    await act(async () => {
      await user.click(input);
    });
    
    // Step 3: Press arrow down and check if any dropdown appears
    await act(async () => {
      await user.keyboard('{ArrowDown}');
    });
    
    // Check for any dropdown-related elements
    const dropdownElements = screen.queryAllByText(/Browser Name/);
    
    // If we find any dropdown elements, the dropdown is working
    if (dropdownElements.length > 0) {
      console.log('SUCCESS: Dropdown is rendering!');
    } else {
      console.log('PROBLEM: No dropdown elements found');
      
      // Check if our test-id exists
      const dropdown = screen.queryByTestId('filter-key-dropdown-enhanced');
      console.log('Dropdown element by test-id:', dropdown ? 'EXISTS' : 'NOT FOUND');
    }
    
    // This test is just for debugging - we expect it to pass
    expect(input).toBeInTheDocument();
  });
});