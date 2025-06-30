import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchQueryBuilder } from './SearchQueryBuilder';
import { FilterKey, FilterKeySection } from '@/types';

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

describe('TokenizedQueryGrid Container Click Behavior', () => {
  describe('Empty Query Container Clicks', () => {
    it('should focus input when clicking on empty container', async () => {
      const user = userEvent.setup();
      render(
        <SearchQueryBuilder
          query=""
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
        />
      );

      // Click on the main container
      const container = screen.getByTestId('search-query-builder');
      await user.click(container);

      // The input should be focused
      const input = screen.getByTestId('inter-token-input-0');
      expect(input).toHaveFocus();
    });

    it('should focus input when clicking on inner grid area', async () => {
      const user = userEvent.setup();
      render(
        <SearchQueryBuilder
          query=""
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
        />
      );

      const container = screen.getByTestId('search-query-builder');
      const gridArea = container.querySelector('.flex.flex-wrap') as HTMLElement;
      
      await user.click(gridArea);

      const input = screen.getByTestId('inter-token-input-0');
      expect(input).toHaveFocus();
    });

    it('should not interfere with input clicks', async () => {
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

  describe('Query with Tokens Container Clicks', () => {
    it('should focus last input when clicking on empty space after tokens', async () => {
      const user = userEvent.setup();
      render(
        <SearchQueryBuilder
          query="browser.name:Chrome environment:production"
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
        />
      );

      // Click on container area after tokens
      const container = screen.getByTestId('search-query-builder');
      await user.click(container);

      // Should focus the last input (index 2, after both tokens)
      const lastInput = screen.getByTestId('inter-token-input-2');
      expect(lastInput).toHaveFocus();
    });

    it('should not interfere with token clicks', async () => {
      const user = userEvent.setup();
      render(
        <SearchQueryBuilder
          query="browser.name:Chrome"
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
        />
      );

      // Click on the token itself
      const token = screen.getByTestId('filter-token-0');
      await user.click(token);

      // Token should handle its own focus
      const filterKeyButton = token.querySelector('[data-part="key"]') as HTMLElement;
      expect(filterKeyButton).toHaveFocus();
    });

    it('should not interfere with dropdown clicks', async () => {
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

      // Wait for dropdown
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Browser Name/ })).toBeInTheDocument();
      });

      // Click on dropdown item
      const dropdownItem = screen.getByRole('button', { name: /Browser Name/ });
      await user.click(dropdownItem);

      // Should not cause container click behavior
      // Instead should select the item and create token
      await waitFor(() => {
        expect(screen.getByTestId('filter-token-0')).toBeInTheDocument();
      });
    });
  });

  describe('Focus Management', () => {
    it('should maintain cursor text style on container', () => {
      render(
        <SearchQueryBuilder
          query=""
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
        />
      );

      const gridContainer = screen.getByTestId('search-query-builder')
        .querySelector('.cursor-text');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should focus appropriate input based on click position', async () => {
      const user = userEvent.setup();
      render(
        <SearchQueryBuilder
          query="browser.name:Chrome"
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
        />
      );

      // Click before the first token (should focus first input)
      const firstInput = screen.getByTestId('inter-token-input-0');
      await user.click(firstInput);
      expect(firstInput).toHaveFocus();

      // Click after the token (should focus last input)
      const container = screen.getByTestId('search-query-builder');
      await user.click(container);
      
      const lastInput = screen.getByTestId('inter-token-input-1');
      expect(lastInput).toHaveFocus();
    });

    it('should handle programmatic focus correctly', async () => {
      const user = userEvent.setup();
      render(
        <SearchQueryBuilder
          query="browser.name:Chrome"
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
        />
      );

      // Simulate programmatic focus (like from container click)
      const container = screen.getByTestId('search-query-builder');
      await user.click(container);

      // Should focus the last input and allow immediate keyboard interaction
      const lastInput = screen.getByTestId('inter-token-input-1');
      expect(lastInput).toHaveFocus();

      // Should be able to immediately use arrow keys
      await user.keyboard('{ArrowDown}');
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Browser Name/ })).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid clicks gracefully', async () => {
      const user = userEvent.setup();
      render(
        <SearchQueryBuilder
          query=""
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
        />
      );

      const container = screen.getByTestId('search-query-builder');
      
      // Multiple rapid clicks
      await user.click(container);
      await user.click(container);
      await user.click(container);

      const input = screen.getByTestId('inter-token-input-0');
      expect(input).toHaveFocus();
    });

    it('should handle clicks during dropdown interaction', async () => {
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

      // Wait for dropdown
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Browser Name/ })).toBeInTheDocument();
      });

      // Click on container while dropdown is open
      const container = screen.getByTestId('search-query-builder');
      await user.click(container);

      // Should not interfere with dropdown
      expect(screen.getByRole('button', { name: /Browser Name/ })).toBeInTheDocument();
    });

    it('should work with disabled state', () => {
      render(
        <SearchQueryBuilder
          query=""
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
          disabled={true}
        />
      );

      const container = screen.getByTestId('search-query-builder');
      expect(container).toHaveClass('cursor-not-allowed');
      
      // Input should be disabled
      const input = screen.getByTestId('inter-token-input-0');
      expect(input).toBeDisabled();
    });
  });
});