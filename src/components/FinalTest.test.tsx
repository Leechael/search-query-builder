import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
  {
    key: 'environment',
    name: 'Environment',
    kind: 'tag', 
    valueType: 'string',
    allowedOperators: ['=', '!='],
  },
];

describe('Final Validation Tests', () => {
  it('should show dropdown when pressing arrow down on focused input', async () => {
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
    
    // Focus the input
    await user.click(input);
    
    // Press arrow down
    await user.keyboard('{ArrowDown}');

    // Should show dropdown
    await waitFor(() => {
      expect(screen.getByTestId('filter-key-dropdown-enhanced')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should show filter keys in dropdown', async () => {
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
    await user.click(input);
    await user.keyboard('{ArrowDown}');

    await waitFor(() => {
      expect(screen.getByTestId('filter-key-dropdown-enhanced')).toBeInTheDocument();
      expect(screen.getByText('Browser Name')).toBeInTheDocument();
      expect(screen.getByText('Environment')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should navigate dropdown items with arrow keys', async () => {
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
    await user.click(input);
    await user.keyboard('{ArrowDown}');

    // Wait for dropdown to appear
    await waitFor(() => {
      expect(screen.getByTestId('filter-key-dropdown-enhanced')).toBeInTheDocument();
    });

    // Wait for first item to be highlighted
    await waitFor(() => {
      const firstItem = screen.getByRole('button', { name: /Browser Name/ });
      expect(firstItem).toHaveClass('bg-primary-100');
    }, { timeout: 1000 });

    // Press arrow down to move to next item
    await user.keyboard('{ArrowDown}');

    // Check if second item gets highlighted
    const secondItem = screen.getByRole('button', { name: /Environment/ });
    expect(secondItem).toHaveClass('bg-primary-100');
  });

  it('should show dropdown when clicking on already focused input', async () => {
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
    
    // First click to focus
    await user.click(input);
    
    // Second click should show dropdown
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByTestId('filter-key-dropdown-enhanced')).toBeInTheDocument();
    }, { timeout: 1000 });
  });
});