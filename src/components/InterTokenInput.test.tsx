import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InterTokenInput } from './InterTokenInput';
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
  {
    key: 'user.email',
    name: 'User Email',
    kind: 'field',
    valueType: 'string', 
    allowedOperators: ['=', '!='],
  },
];

const mockFilterKeySections: FilterKeySection[] = [
  {
    key: 'fields',
    label: 'Fields',
    children: mockFilterKeys.filter(key => key.kind === 'field'),
  },
  {
    key: 'tags', 
    label: 'Tags',
    children: mockFilterKeys.filter(key => key.kind === 'tag'),
  },
];

const renderWithProvider = (inputIndex: number = 0, focused: boolean = false) => {
  return render(
    <SearchQueryBuilder
      query=""
      onChange={() => {}}
      onSearch={() => {}}
      filterKeys={mockFilterKeys}
      filterKeySections={mockFilterKeySections}
    />
  );
};

describe('InterTokenInput', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Container Click Focus', () => {
    it('should focus last input when clicking on empty container space', async () => {
      const user = userEvent.setup();
      render(
        <SearchQueryBuilder
          query=""
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
          filterKeySections={mockFilterKeySections}
        />
      );

      const container = screen.getByTestId('search-query-builder');
      await user.click(container);

      // Last input should be focused
      const lastInput = screen.getByTestId('inter-token-input-0');
      expect(lastInput).toHaveFocus();
    });

    it('should focus last input when clicking on grid container', async () => {
      const user = userEvent.setup();
      render(
        <SearchQueryBuilder
          query="browser.name:Chrome"
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
          filterKeySections={mockFilterKeySections}
        />
      );

      // Click on the tokenized grid area but not on a token
      const container = screen.getByTestId('search-query-builder');
      const gridArea = container.querySelector('.flex.flex-wrap') as HTMLElement;
      await user.click(gridArea);

      // Last input (after the token) should be focused
      const lastInput = screen.getByTestId('inter-token-input-1');
      expect(lastInput).toHaveFocus();
    });
  });

  describe('Arrow Key Autocomplete Activation', () => {
    it('should show dropdown when pressing ArrowDown on focused input', async () => {
      const user = userEvent.setup();
      render(
        <SearchQueryBuilder
          query=""
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
          filterKeySections={mockFilterKeySections}
        />
      );

      const input = screen.getByTestId('inter-token-input-0');
      await user.click(input);
      
      // Press ArrowDown to activate dropdown
      await user.keyboard('{ArrowDown}');

      // Dropdown should appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Browser Name/ })).toBeInTheDocument();
      });
    });

    it('should show dropdown when pressing ArrowUp on focused input', async () => {
      const user = userEvent.setup();
      render(
        <SearchQueryBuilder
          query=""
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
          filterKeySections={mockFilterKeySections}
        />
      );

      const input = screen.getByTestId('inter-token-input-0');
      await user.click(input);
      
      // Press ArrowUp to activate dropdown
      await user.keyboard('{ArrowUp}');

      // Dropdown should appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Browser Name/ })).toBeInTheDocument();
      });
    });

    it('should navigate dropdown items with arrow keys', async () => {
      const user = userEvent.setup();
      render(
        <SearchQueryBuilder
          query=""
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
          filterKeySections={mockFilterKeySections}
        />
      );

      const input = screen.getByTestId('inter-token-input-0');
      await user.click(input);
      await user.keyboard('{ArrowDown}');

      // Wait for dropdown to appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Browser Name/ })).toBeInTheDocument();
      });

      // First item should be highlighted initially
      const firstItem = screen.getByRole('button', { name: /Browser Name/ });
      expect(firstItem).toHaveClass('bg-primary-100');

      // Press ArrowDown to move to next item
      await user.keyboard('{ArrowDown}');

      // Check if second item gets highlighted
      const secondItem = screen.getByRole('button', { name: /Environment/ });
      expect(secondItem).toHaveClass('bg-primary-100');
    });
  });

  describe('Focus After Autocomplete Selection', () => {
    it('should focus token value after selecting from autocomplete', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(
        <SearchQueryBuilder
          query=""
          onChange={onChange}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
          filterKeySections={mockFilterKeySections}
        />
      );

      const input = screen.getByTestId('inter-token-input-0');
      await user.click(input);
      await user.keyboard('{ArrowDown}');

      // Wait for dropdown and select first item
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Browser Name/ })).toBeInTheDocument();
      });

      const browserNameOption = screen.getByRole('button', { name: /Browser Name/ });
      await user.click(browserNameOption);

      // Should focus on the value part of the newly created token
      await waitFor(() => {
        const valueButton = screen.getByRole('button', { name: /value/ });
        expect(valueButton).toHaveFocus();
      });
    });
  });

  describe('Enhanced Autocomplete Dropdown', () => {
    it('should show tabs in dropdown', async () => {
      const user = userEvent.setup();
      render(
        <SearchQueryBuilder
          query=""
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
          filterKeySections={mockFilterKeySections}
        />
      );

      const input = screen.getByTestId('inter-token-input-0');
      await user.click(input);
      await user.keyboard('{ArrowDown}');

      // Wait for dropdown and check for tabs
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Recent/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Fields/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Tags/ })).toBeInTheDocument();
      });
    });

    it('should switch tabs with left/right arrow keys', async () => {
      const user = userEvent.setup();
      render(
        <SearchQueryBuilder
          query=""
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
          filterKeySections={mockFilterKeySections}
        />
      );

      const input = screen.getByTestId('inter-token-input-0');
      await user.click(input);
      await user.keyboard('{ArrowDown}');

      // Wait for dropdown
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Recent/ })).toBeInTheDocument();
      });

      // Press ArrowRight to switch tabs
      await user.keyboard('{ArrowRight}');

      // Check if Fields tab becomes active
      const fieldsTab = screen.getByRole('button', { name: /Fields/ });
      expect(fieldsTab).toHaveClass('border-primary-500');
    });

    it('should save and display recent searches', async () => {
      const user = userEvent.setup();
      
      // First interaction - select a filter key
      const { unmount } = render(
        <SearchQueryBuilder
          query=""
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
          filterKeySections={mockFilterKeySections}
        />
      );

      let input = screen.getByTestId('inter-token-input-0');
      await user.click(input);
      await user.keyboard('{ArrowDown}');

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Browser Name/ })).toBeInTheDocument();
      });

      const browserNameOption = screen.getByRole('button', { name: /Browser Name/ });
      await user.click(browserNameOption);

      unmount();

      // Second interaction - should show recent searches
      render(
        <SearchQueryBuilder
          query=""
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
          filterKeySections={mockFilterKeySections}
        />
      );

      input = screen.getByTestId('inter-token-input-0');
      await user.click(input);
      await user.keyboard('{ArrowDown}');

      // Recent tab should show the previously selected item
      await waitFor(() => {
        const recentTab = screen.getByRole('button', { name: /Recent/ });
        expect(recentTab).toHaveClass('border-primary-500'); // Should be active by default
        expect(screen.getByRole('button', { name: /Browser Name/ })).toBeInTheDocument();
      });
    });
  });

  describe('Autocomplete Trigger Behavior', () => {
    it('should not show dropdown on initial page load', () => {
      render(
        <SearchQueryBuilder
          query=""
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
          filterKeySections={mockFilterKeySections}
        />
      );

      // Should not show dropdown initially
      expect(screen.queryByRole('button', { name: /Browser Name/ })).not.toBeInTheDocument();
    });

    it('should not show dropdown on input focus alone', async () => {
      const user = userEvent.setup();
      render(
        <SearchQueryBuilder
          query=""
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
          filterKeySections={mockFilterKeySections}
        />
      );

      const input = screen.getByTestId('inter-token-input-0');
      await user.click(input);

      // Dropdown should not appear just from focus
      expect(screen.queryByRole('button', { name: /Browser Name/ })).not.toBeInTheDocument();
    });

    it('should show dropdown when clicking on already focused input', async () => {
      const user = userEvent.setup();
      render(
        <SearchQueryBuilder
          query=""
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
          filterKeySections={mockFilterKeySections}
        />
      );

      const input = screen.getByTestId('inter-token-input-0');
      
      // First click to focus
      await user.click(input);
      
      // Second click should trigger dropdown
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Browser Name/ })).toBeInTheDocument();
      });
    });

    it('should close dropdown with Escape key', async () => {
      const user = userEvent.setup();
      render(
        <SearchQueryBuilder
          query=""
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
          filterKeySections={mockFilterKeySections}
        />
      );

      const input = screen.getByTestId('inter-token-input-0');
      await user.click(input);
      await user.keyboard('{ArrowDown}');

      // Wait for dropdown to appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Browser Name/ })).toBeInTheDocument();
      });

      // Press Escape to close
      await user.keyboard('{Escape}');

      // Dropdown should be gone
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /Browser Name/ })).not.toBeInTheDocument();
      });
    });
  });

  describe('Search and Filter', () => {
    it('should filter dropdown items based on input text', async () => {
      const user = userEvent.setup();
      render(
        <SearchQueryBuilder
          query=""
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
          filterKeySections={mockFilterKeySections}
        />
      );

      const input = screen.getByTestId('inter-token-input-0');
      await user.click(input);
      
      // Type to filter
      await user.type(input, 'browser');
      await user.keyboard('{ArrowDown}');

      // Should only show filtered results
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Browser Name/ })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Environment/ })).not.toBeInTheDocument();
      });
    });

    it('should auto-switch to best tab when searching', async () => {
      const user = userEvent.setup();
      render(
        <SearchQueryBuilder
          query=""
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
          filterKeySections={mockFilterKeySections}
        />
      );

      const input = screen.getByTestId('inter-token-input-0');
      await user.click(input);
      
      // Type to filter for field items
      await user.type(input, 'browser');
      await user.keyboard('{ArrowDown}');

      // Should auto-switch to Fields tab since that's where results are
      await waitFor(() => {
        const fieldsTab = screen.getByRole('button', { name: /Fields/ });
        expect(fieldsTab).toHaveClass('border-primary-500');
      });
    });
  });

  describe('Keyboard Navigation Integration', () => {
    it('should allow horizontal navigation between inputs even with dropdown open', async () => {
      const user = userEvent.setup();
      render(
        <SearchQueryBuilder
          query="browser.name:Chrome"
          onChange={() => {}}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
          filterKeySections={mockFilterKeySections}
        />
      );

      // Focus the first input
      const firstInput = screen.getByTestId('inter-token-input-0');
      await user.click(firstInput);
      await user.keyboard('{ArrowDown}');

      // Wait for dropdown
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Browser Name/ })).toBeInTheDocument();
      });

      // Press ArrowRight to move to next element (should move to token)
      await user.keyboard('{ArrowRight}');

      // Should focus the filter key part of the token
      const filterKeyButton = screen.getByRole('button', { name: /browser.name/ });
      expect(filterKeyButton).toHaveFocus();
    });

    it('should allow Enter to select from dropdown', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(
        <SearchQueryBuilder
          query=""
          onChange={onChange}
          onSearch={() => {}}
          filterKeys={mockFilterKeys}
          filterKeySections={mockFilterKeySections}
        />
      );

      const input = screen.getByTestId('inter-token-input-0');
      await user.click(input);
      await user.keyboard('{ArrowDown}');

      // Wait for dropdown and navigate to second item
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Browser Name/ })).toBeInTheDocument();
      });

      await user.keyboard('{ArrowDown}'); // Move to Environment
      await user.keyboard('{Enter}'); // Select

      // Should create token with environment filter
      expect(onChange).toHaveBeenCalledWith(expect.stringContaining('environment:'));
    });
  });
});