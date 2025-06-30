import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ValueDropdown } from './ValueDropdown';
import { MockApiClient } from '../api/client';

const mockProps = {
  filterKey: 'browser.name',
  currentValue: 'Chrome',
  onSelect: jest.fn(),
  onClose: jest.fn(),
};

const mockContext = {
  apiClient: new MockApiClient(),
};

// Mock the useSearchQueryBuilder hook
jest.mock('./SearchQueryBuilder', () => ({
  useSearchQueryBuilder: () => mockContext,
}));

describe('ValueDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Dropdown Click Behavior', () => {
    it('should not close when clicking inside dropdown container (not on buttons)', async () => {
      render(<ValueDropdown {...mockProps} />);

      // Wait for suggestions to load
      await waitFor(() => {
        expect(screen.getByText('Chrome')).toBeInTheDocument();
      });

      const dropdown = screen.getByText('Chrome').closest('.absolute');
      expect(dropdown).toBeInTheDocument();

      // Click on the dropdown container itself (not on a button)
      await userEvent.click(dropdown!);

      // onClose should NOT be called when clicking on container
      expect(mockProps.onClose).not.toHaveBeenCalled();
    });

    it('should not close when clicking on search input inside dropdown', async () => {
      render(<ValueDropdown {...mockProps} />);

      const searchInput = screen.getByPlaceholderText('Search or type value...');
      
      // Click on search input
      await userEvent.click(searchInput);

      // onClose should NOT be called
      expect(mockProps.onClose).not.toHaveBeenCalled();
    });

    it('should not close when clicking on multi-select toggle', async () => {
      render(<ValueDropdown {...mockProps} />);

      const multiSelectToggle = screen.getByText('Multi select');
      
      // Click on multi-select toggle
      await userEvent.click(multiSelectToggle);

      // onClose should NOT be called
      expect(mockProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('Multi-Select Behavior', () => {
    it('should not close dropdown when selecting values in multi-select mode', async () => {
      render(<ValueDropdown {...mockProps} />);

      // Enable multi-select mode
      const multiSelectToggle = screen.getByText('Multi select');
      await userEvent.click(multiSelectToggle);

      // Wait for suggestions to load
      await waitFor(() => {
        expect(screen.getByText('Firefox')).toBeInTheDocument();
      });

      // Select Firefox (different from current value Chrome)
      await userEvent.click(screen.getByText('Firefox'));

      // onClose should NOT be called in multi-select mode
      expect(mockProps.onClose).not.toHaveBeenCalled();
      
      // Should show Firefox as selected (both values should be selected)
      expect(screen.getByText('Selected (2):')).toBeInTheDocument();
      
      // Both Chrome and Firefox should show checkmarks in the list
      const checkmarks = screen.getAllByText('✓');
      expect(checkmarks).toHaveLength(2);
    });

    it('should allow selecting multiple values without closing', async () => {
      render(<ValueDropdown {...mockProps} />);

      // Enable multi-select mode
      await userEvent.click(screen.getByText('Multi select'));

      // Wait for suggestions to load
      await waitFor(() => {
        expect(screen.getByText('Firefox')).toBeInTheDocument();
        expect(screen.getByText('Safari')).toBeInTheDocument();
      });

      // Select multiple values by clicking on suggestion buttons
      const firefoxButton = screen.getByRole('button', { name: /Firefox/i });
      const safariButton = screen.getByRole('button', { name: /Safari/i });
      
      await userEvent.click(firefoxButton);
      await userEvent.click(safariButton);

      // Should show multiple selected items (Chrome + Firefox + Safari = 3)
      await waitFor(() => {
        expect(screen.getByText('Selected (3):')).toBeInTheDocument();
      });
      
      // Should show checkmarks for selected items
      const checkmarks = screen.getAllByText('✓');
      expect(checkmarks).toHaveLength(3);

      // onClose should still NOT be called
      expect(mockProps.onClose).not.toHaveBeenCalled();
    });

    it('should close dropdown only when clicking Apply in multi-select mode', async () => {
      render(<ValueDropdown {...mockProps} />);

      // Enable multi-select mode
      await userEvent.click(screen.getByText('Multi select'));

      // Select some values
      await waitFor(() => {
        expect(screen.getByText('Chrome')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByText('Chrome'));

      // Click Apply button
      const applyButton = screen.getByText('Apply');
      await userEvent.click(applyButton);

      // Now onClose should be called
      expect(mockProps.onClose).toHaveBeenCalled();
      expect(mockProps.onSelect).toHaveBeenCalledWith(['Chrome']);
    });

    it('should close dropdown when clicking Cancel in multi-select mode', async () => {
      render(<ValueDropdown {...mockProps} />);

      // Enable multi-select mode
      await userEvent.click(screen.getByText('Multi select'));

      // Click Cancel button
      const cancelButton = screen.getByText('Cancel');
      await userEvent.click(cancelButton);

      // onClose should be called
      expect(mockProps.onClose).toHaveBeenCalled();
      expect(mockProps.onSelect).not.toHaveBeenCalled();
    });
  });

  describe('Single Select Behavior', () => {
    it('should close dropdown immediately when selecting value in single-select mode', async () => {
      render(<ValueDropdown {...mockProps} />);

      // Wait for suggestions
      await waitFor(() => {
        expect(screen.getByText('Chrome')).toBeInTheDocument();
      });

      // Select a value in single-select mode
      await userEvent.click(screen.getByText('Chrome'));

      // onClose should be called immediately
      expect(mockProps.onClose).toHaveBeenCalled();
      expect(mockProps.onSelect).toHaveBeenCalledWith('Chrome');
    });
  });

  describe('Input Behavior', () => {
    it('should filter suggestions based on input without closing dropdown', async () => {
      render(<ValueDropdown {...mockProps} />);

      const searchInput = screen.getByPlaceholderText('Search or type value...');
      
      // Type to filter
      await userEvent.type(searchInput, 'Chr');

      // Should filter suggestions
      await waitFor(() => {
        expect(screen.getByText('Chrome')).toBeInTheDocument();
        expect(screen.queryByText('Firefox')).not.toBeInTheDocument();
      });

      // onClose should NOT be called
      expect(mockProps.onClose).not.toHaveBeenCalled();
    });

    it('should create custom value on Enter press', async () => {
      render(<ValueDropdown {...mockProps} />);

      const searchInput = screen.getByPlaceholderText('Search or type value...');
      
      // Type custom value and press Enter
      await userEvent.type(searchInput, 'CustomValue{enter}');

      // Should call onSelect with custom value and close
      expect(mockProps.onSelect).toHaveBeenCalledWith('CustomValue');
      expect(mockProps.onClose).toHaveBeenCalled();
    });
  });
});