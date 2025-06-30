import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchQueryBuilder } from './SearchQueryBuilder';
import { MockApiClient } from '@/api/client';
import { FilterKey } from '@/types';

const mockFilterKeys: FilterKey[] = [
  {
    key: 'browser.name',
    name: 'Browser Name',
    kind: 'field',
    valueType: 'string',
    allowedOperators: ['=', '!=', 'contains'],
  },
  {
    key: 'status',
    name: 'Status',
    kind: 'field',
    valueType: 'string',
    allowedOperators: ['=', '!='],
  },
];

describe('SearchQueryBuilder', () => {
  const defaultProps = {
    query: '',
    onChange: jest.fn(),
    onSearch: jest.fn(),
    filterKeys: mockFilterKeys,
    apiClient: new MockApiClient(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with empty query', () => {
    render(<SearchQueryBuilder {...defaultProps} />);
    expect(screen.getByTestId('search-query-builder')).toBeInTheDocument();
    expect(screen.getByTestId('tokenized-input')).toBeInTheDocument();
  });

  it('should render with initial query', () => {
    render(<SearchQueryBuilder {...defaultProps} query="browser.name:Chrome" />);
    expect(screen.getByTestId('search-query-builder')).toBeInTheDocument();
    expect(screen.getByTestId('filter-token')).toBeInTheDocument();
  });

  it('should call onChange when query changes', async () => {
    const onChange = jest.fn();
    render(<SearchQueryBuilder {...defaultProps} onChange={onChange} />);
    
    const input = screen.getByTestId('tokenized-input');
    await userEvent.type(input, 'hello');
    
    expect(onChange).toHaveBeenCalled();
  });

  it('should call onSearch when Enter is pressed', async () => {
    const onSearch = jest.fn();
    render(<SearchQueryBuilder {...defaultProps} onSearch={onSearch} query="test" />);
    
    const input = screen.getByTestId('tokenized-input');
    await userEvent.type(input, '{enter}');
    
    expect(onSearch).toHaveBeenCalledWith('test');
  });

  it('should show filter dropdown when typing', async () => {
    render(<SearchQueryBuilder {...defaultProps} />);
    
    const input = screen.getByTestId('tokenized-input');
    await userEvent.type(input, 'browser');
    
    await waitFor(() => {
      expect(screen.getByText('Browser Name')).toBeInTheDocument();
    });
  });

  it('should create filter token when typing filter syntax', async () => {
    const onChange = jest.fn();
    render(<SearchQueryBuilder {...defaultProps} onChange={onChange} />);
    
    const input = screen.getByTestId('tokenized-input');
    await userEvent.type(input, 'browser.name:Chrome{enter}');
    
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.stringContaining('browser.name:Chrome'));
    });
  });

  it('should clear query when clear button is clicked', async () => {
    const onChange = jest.fn();
    render(<SearchQueryBuilder {...defaultProps} query="test query" onChange={onChange} />);
    
    const clearButton = screen.getByLabelText('Clear search');
    await userEvent.click(clearButton);
    
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('should handle disabled state', () => {
    render(<SearchQueryBuilder {...defaultProps} disabled={true} />);
    
    const input = screen.getByTestId('tokenized-input');
    expect(input).toBeDisabled();
  });

  it('should render plain text mode when disallowFreeText is true', () => {
    render(<SearchQueryBuilder {...defaultProps} disallowFreeText={true} />);
    
    expect(screen.getByTestId('plain-text-input')).toBeInTheDocument();
  });

  it('should support custom placeholder', () => {
    const placeholder = 'Custom search placeholder';
    render(<SearchQueryBuilder {...defaultProps} placeholder={placeholder} />);
    
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });

  describe('Filter Token Interactions', () => {
    it('should edit filter token when clicked', async () => {
      render(<SearchQueryBuilder {...defaultProps} query="browser.name:Chrome" />);
      
      const filterToken = screen.getByTestId('filter-token');
      await userEvent.click(filterToken);
      
      // Token should be focused/editable
      expect(filterToken).toHaveClass(/border-primary-500|bg-primary-50/);
    });

    it('should not trigger filter dropdown when clicking on filter token', async () => {
      render(<SearchQueryBuilder {...defaultProps} query="browser.name:Chrome" />);
      
      const filterToken = screen.getByTestId('filter-token');
      
      // Click on the filter token
      await userEvent.click(filterToken);
      
      // Filter dropdown should not appear
      expect(screen.queryByText('Browser Name')).not.toBeInTheDocument();
      expect(screen.queryByText('Status')).not.toBeInTheDocument();
    });

    it('should show filter dropdown when clicking on empty area of container', async () => {
      render(<SearchQueryBuilder {...defaultProps} query="browser.name:Chrome" />);
      
      const container = screen.getByTestId('search-query-builder');
      
      // Click on the container (not on the token)
      await userEvent.click(container);
      
      await waitFor(() => {
        // Filter dropdown should appear
        expect(screen.getByText('Browser Name')).toBeInTheDocument();
      });
    });

    it('should remove filter token when delete button is clicked', async () => {
      const onChange = jest.fn();
      render(<SearchQueryBuilder {...defaultProps} query="browser.name:Chrome" onChange={onChange} />);
      
      const removeButton = screen.getByLabelText('Remove filter');
      await userEvent.click(removeButton);
      
      expect(onChange).toHaveBeenCalledWith('');
    });

    it('should delete token when backspace is pressed on empty input', async () => {
      const onChange = jest.fn();
      render(<SearchQueryBuilder {...defaultProps} query="browser.name:Chrome" onChange={onChange} />);
      
      const input = screen.getByTestId('tokenized-input');
      input.focus();
      await userEvent.keyboard('{backspace}');
      
      expect(onChange).toHaveBeenCalledWith('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<SearchQueryBuilder {...defaultProps} />);
      
      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      render(<SearchQueryBuilder {...defaultProps} query="browser.name:Chrome" />);
      
      const filterToken = screen.getByTestId('filter-token');
      filterToken.focus();
      
      await userEvent.keyboard('{delete}');
      
      // Token should be removed
      expect(screen.queryByTestId('filter-token')).not.toBeInTheDocument();
    });
  });
});