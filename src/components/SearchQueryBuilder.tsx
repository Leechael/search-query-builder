import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { SearchQueryBuilderProps, ApiClient } from '@/types';
import { useQueryBuilder } from '@/hooks/useQueryBuilder';
import { TokenizedQueryGrid } from './TokenizedQueryGrid';
import { PlainTextInput } from './PlainTextInput';
import { FilterKeyDropdownEnhanced } from './FilterKeyDropdownEnhanced';
import { SearchIcon, XIcon } from './Icons';
import { dropdownManager } from '@/utils/dropdownManager';

interface SearchQueryBuilderContextValue {
  state: ReturnType<typeof useQueryBuilder>['state'];
  setQuery: ReturnType<typeof useQueryBuilder>['setQuery'];
  addToken: ReturnType<typeof useQueryBuilder>['addToken'];
  updateToken: ReturnType<typeof useQueryBuilder>['updateToken'];
  removeToken: ReturnType<typeof useQueryBuilder>['removeToken'];
  setFocusState: ReturnType<typeof useQueryBuilder>['setFocusState'];
  setUncommittedToken: ReturnType<typeof useQueryBuilder>['setUncommittedToken'];
  setActiveDropdown: ReturnType<typeof useQueryBuilder>['setActiveDropdown'];
  moveFocus: ReturnType<typeof useQueryBuilder>['moveFocus'];
  clear: ReturnType<typeof useQueryBuilder>['clear'];
  search: ReturnType<typeof useQueryBuilder>['search'];
  addFilter: ReturnType<typeof useQueryBuilder>['addFilter'];
  apiClient?: ApiClient;
  filterKeys: SearchQueryBuilderProps['filterKeys'];
  filterKeySections: SearchQueryBuilderProps['filterKeySections'];
  disabled: boolean;
  placeholder: string;
  // Dropdown state management
  dropdownSearchQuery: string;
  setDropdownSearchQuery: (query: string) => void;
  dropdownHighlightedIndex: number;
  setDropdownHighlightedIndex: (index: number) => void;
  dropdownInputIndex: number | null;
  setDropdownInputIndex: (index: number | null) => void;
}

const SearchQueryBuilderContext = createContext<SearchQueryBuilderContextValue | null>(null);

export function useSearchQueryBuilder() {
  const context = useContext(SearchQueryBuilderContext);
  if (!context) {
    throw new Error('useSearchQueryBuilder must be used within SearchQueryBuilderProvider');
  }
  return context;
}

function SearchIndicator() {
  return (
    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
      <SearchIcon className="w-4 h-4 text-gray-400" />
    </div>
  );
}

function ActionButtons() {
  const { state, clear } = useSearchQueryBuilder();
  
  return (
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
      <button
        type="button"
        onClick={clear}
        className={`p-1 rounded ${
          state.query ? 'text-gray-400 hover:text-gray-600' : 'text-gray-300'
        }`}
        aria-label="Clear search"
        disabled={!state.query}
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

interface SearchQueryBuilderUIProps extends SearchQueryBuilderProps {
  useTokenizedInterface?: boolean;
}

function SearchQueryBuilderUI({ 
  useTokenizedInterface = true, 
  placeholder = 'Search...',
  disabled = false,
  className = '',
}: SearchQueryBuilderUIProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownIdRef = useRef(Math.random().toString(36).substr(2, 9)); // Generate unique ID
  const { 
    state, 
    filterKeys, 
    addToken, 
    setActiveDropdown,
    dropdownSearchQuery,
    dropdownHighlightedIndex,
    setDropdownHighlightedIndex,
    dropdownInputIndex
  } = useSearchQueryBuilder();
  
  const baseClasses = `
    w-full min-h-[40px] border border-gray-300 rounded-md 
    bg-white focus-within:ring-2 focus-within:ring-primary-500 
    focus-within:border-primary-500 transition-colors
    ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'cursor-text'}
    ${className}
  `;

  // Show dropdown when it's a filter-key dropdown
  const showDropdown = state.activeDropdown.type === 'filter-key' && dropdownInputIndex !== null;

  // Handle global dropdown management and outside clicks
  useEffect(() => {
    if (showDropdown) {
      // Register this dropdown with the global manager
      dropdownManager.openDropdown(dropdownIdRef.current, () => {
        setActiveDropdown({ type: null });
      });
    } else {
      // Unregister this dropdown
      dropdownManager.closeDropdown(dropdownIdRef.current);
    }
  }, [showDropdown, setActiveDropdown]);

  // Handle clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Click is outside this component
        if (showDropdown) {
          setActiveDropdown({ type: null });
        }
      }
    };

    if (showDropdown) {
      // Add listener when dropdown is open
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown, setActiveDropdown]);

  const handleFilterKeySelect = (key: string) => {
    if (dropdownInputIndex === null) return;
    
    const newToken = {
      key: `filter_${Date.now()}`,
      type: 'filter',
      filterKey: key,
      operator: '=',
      value: '',
    } as any;
    
    addToken(newToken, dropdownInputIndex);
    setActiveDropdown({ type: null });
    
    // Focus on the value part of the newly created token
    setTimeout(() => {
      // This would need to be implemented in TokenizedQueryGrid
    }, 0);
  };

  return (
    <div 
      ref={containerRef}
      className={`${baseClasses} relative`}
      data-testid="search-query-builder"
    >
      <SearchIndicator />
      
      {useTokenizedInterface ? (
        <TokenizedQueryGrid placeholder={placeholder} disabled={disabled} />
      ) : (
        <PlainTextInput placeholder={placeholder} disabled={disabled} />
      )}
      
      <ActionButtons />
      
      {/* Dropdown positioned within the container to maintain focus-within state */}
      {showDropdown && (
        <FilterKeyDropdownEnhanced
          onSelect={handleFilterKeySelect}
          searchQuery={dropdownSearchQuery}
          onClose={() => {
            setActiveDropdown({ type: null });
          }}
          highlightedIndex={dropdownHighlightedIndex}
          onHighlightChange={setDropdownHighlightedIndex}
          width="100%"
        />
      )}
    </div>
  );
}

export function SearchQueryBuilder(props: SearchQueryBuilderProps) {
  const queryBuilderState = useQueryBuilder({
    initialQuery: props.query,
    onChange: props.onChange,
    onSearch: props.onSearch,
    apiClient: props.apiClient,
  });

  // Dropdown state
  const [dropdownSearchQuery, setDropdownSearchQuery] = useState('');
  const [dropdownHighlightedIndex, setDropdownHighlightedIndex] = useState(-1);
  const [dropdownInputIndex, setDropdownInputIndex] = useState<number | null>(null);

  const contextValue: SearchQueryBuilderContextValue = {
    ...queryBuilderState,
    filterKeys: props.filterKeys || [],
    filterKeySections: props.filterKeySections,
    disabled: props.disabled || false,
    placeholder: props.placeholder || 'Search...',
    dropdownSearchQuery,
    setDropdownSearchQuery,
    dropdownHighlightedIndex,
    setDropdownHighlightedIndex,
    dropdownInputIndex,
    setDropdownInputIndex,
  };

  return (
    <SearchQueryBuilderContext.Provider value={contextValue}>
      <SearchQueryBuilderUI 
        {...props} 
        useTokenizedInterface={!props.disallowFreeText}
      />
    </SearchQueryBuilderContext.Provider>
  );
}