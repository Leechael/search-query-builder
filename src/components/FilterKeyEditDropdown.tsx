import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchQueryBuilder } from './SearchQueryBuilder';
import { FilterKey } from '@/types';
import { TagIcon } from './Icons';

interface FilterKeyEditDropdownProps {
  onSelect: (key: string) => void;
  onClose: () => void;
  currentKey: string;
  autoFocus?: boolean;
  width?: number | string;
}

export function FilterKeyEditDropdown({ 
  onSelect, 
  onClose, 
  currentKey, 
  autoFocus = true,
  width = 400 
}: FilterKeyEditDropdownProps) {
  const { filterKeys, filterKeySections } = useSearchQueryBuilder();
  const [searchQuery, setSearchQuery] = useState(currentKey);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const highlightedItemRef = useRef<HTMLButtonElement>(null);

  const filteredKeys = useMemo(() => {
    if (!filterKeys) return [];
    
    const query = searchQuery.toLowerCase();
    return filterKeys.filter(key => 
      key.key.toLowerCase().includes(query) ||
      key.name.toLowerCase().includes(query)
    );
  }, [filterKeys, searchQuery]);

  const handleKeySelect = (key: string) => {
    onSelect(key);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredKeys.length > 0) {
        setHighlightedIndex(prev => 
          prev < filteredKeys.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredKeys.length > 0) {
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredKeys.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredKeys[highlightedIndex]) {
        handleKeySelect(filteredKeys[highlightedIndex].key);
      } else if (searchQuery.trim()) {
        // Allow custom filter keys
        handleKeySelect(searchQuery.trim());
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Auto-focus input
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

  // Auto-scroll highlighted item
  useEffect(() => {
    if (highlightedIndex >= 0 && highlightedItemRef.current && dropdownRef.current) {
      const highlightedElement = highlightedItemRef.current;
      const container = dropdownRef.current.querySelector('.max-h-80');
      
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = highlightedElement.getBoundingClientRect();
        
        if (elementRect.bottom > containerRect.bottom) {
          container.scrollTop += elementRect.bottom - containerRect.bottom + 8;
        } else if (elementRect.top < containerRect.top) {
          container.scrollTop -= containerRect.top - elementRect.top + 8;
        }
      }
    }
  }, [highlightedIndex]);

  const renderFilterKey = (filterKey: FilterKey, index: number) => {
    const isHighlighted = index === highlightedIndex;
    
    return (
      <button
        key={filterKey.key}
        ref={isHighlighted ? highlightedItemRef : null}
        type="button"
        className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
          isHighlighted ? 'bg-primary-100 text-primary-900' : 'hover:bg-gray-100'
        }`}
        onClick={() => handleKeySelect(filterKey.key)}
        onMouseEnter={() => setHighlightedIndex(index)}
      >
        <TagIcon className="w-4 h-4 text-gray-400" />
        <div className="flex-1">
          <div className="font-medium text-gray-900">{filterKey.name}</div>
          <div className="text-xs text-gray-500">{filterKey.key}</div>
          {filterKey.description && (
            <div className="text-xs text-gray-400 mt-1">{filterKey.description}</div>
          )}
        </div>
        {filterKey.deprecated && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
            Deprecated
          </span>
        )}
      </button>
    );
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50"
      style={{ width: typeof width === 'number' ? `${width}px` : width }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Search input */}
      <div className="p-2 border-b border-gray-200">
        <input
          ref={inputRef}
          type="text"
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Search or type filter key..."
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Filter key list */}
      <div className="max-h-80 overflow-y-auto">
        {filteredKeys.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {searchQuery ? `No filter keys found for "${searchQuery}"` : 'No filter keys found'}
            {searchQuery && (
              <div className="mt-2">
                <button
                  type="button"
                  className="text-primary-600 hover:text-primary-700 text-sm"
                  onClick={() => handleKeySelect(searchQuery)}
                >
                  Use "{searchQuery}" as custom filter key
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-1">
            {filteredKeys.map((filterKey, index) => renderFilterKey(filterKey, index))}
          </div>
        )}
      </div>
    </div>
  );
}