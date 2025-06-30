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
];

describe('Focus and Dropdown Basic Tests', () => {
  describe('Container Click Focus', () => {
    it('should focus input when clicking on container background', async () => {
      const user = userEvent.setup();
      render(
        <SearchQueryBuilder
          query=""
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
        />
      );

      // Get the main container
      const container = screen.getByTestId('search-query-builder');
      
      // Click on it
      await user.click(container);

      // Input should be focused
      const input = screen.getByTestId('inter-token-input-0');
      expect(input).toHaveFocus();
    });

    it('should focus input when clicking directly on input', async () => {
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

      expect(input).toHaveFocus();
    });
  });

  describe('Dropdown Triggering', () => {
    it('should not show dropdown initially', () => {
      render(
        <SearchQueryBuilder
          query=""
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
        />
      );

      // Should not show dropdown
      expect(screen.queryByTestId('filter-key-dropdown-enhanced')).not.toBeInTheDocument();
    });

    it('should show dropdown after clicking input then pressing arrow down', async () => {
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
      
      // Focus input first
      await user.click(input);
      expect(input).toHaveFocus();
      
      // Then press arrow down
      await user.keyboard('{ArrowDown}');

      // Should show dropdown
      await waitFor(() => {
        expect(screen.getByTestId('filter-key-dropdown-enhanced')).toBeInTheDocument();
      }, { timeout: 1000 });
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
      expect(input).toHaveFocus();
      
      // Second click should show dropdown
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByTestId('filter-key-dropdown-enhanced')).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Basic Dropdown Content', () => {
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
      }, { timeout: 1000 });
    });
  });
});