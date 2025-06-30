import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchQueryBuilder } from './SearchQueryBuilder';

interface ValueDropdownProps {
  filterKey: string;
  currentValue: string | string[];
  onSelect: (value: string | string[]) => void;
  onClose: () => void;
}

export function ValueDropdown({ filterKey, currentValue, onSelect, onClose }: ValueDropdownProps) {
  const { apiClient } = useSearchQueryBuilder();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [multiSelectMode, setMultiSelectMode] = useState(Array.isArray(currentValue));
  const [selectedValues, setSelectedValues] = useState<string[]>(
    Array.isArray(currentValue) ? currentValue : currentValue ? [String(currentValue)] : []
  );
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const highlightedItemRef = useRef<HTMLButtonElement>(null);

  const filteredSuggestions = useMemo(() => {
    if (!inputValue) return suggestions;
    return suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [suggestions, inputValue]);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (!apiClient) return;
      
      setLoading(true);
      try {
        const values = await apiClient.getTagValues(filterKey, inputValue);
        setSuggestions(values);
      } catch (error) {
        console.error('Failed to load value suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, [apiClient, filterKey, inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setHighlightedIndex(-1); // Reset highlight when input changes
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setHighlightedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        handleValueSelect(filteredSuggestions[highlightedIndex]);
      } else if (inputValue.trim()) {
        handleValueSelect(inputValue.trim());
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleValueSelect = (value: string) => {
    if (multiSelectMode) {
      const newSelectedValues = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      
      setSelectedValues(newSelectedValues);
      // Don't call onSelect immediately in multi-select mode
      // onSelect will be called when Apply button is clicked
    } else {
      onSelect(value);
      onClose();
    }
    setInputValue('');
  };

  const toggleMultiSelectMode = () => {
    setMultiSelectMode(!multiSelectMode);
    if (!multiSelectMode && !Array.isArray(currentValue)) {
      setSelectedValues(currentValue ? [String(currentValue)] : []);
    }
  };

  const handleApplyMultiSelect = () => {
    onSelect(selectedValues);
    onClose();
  };

  // Auto-scroll to highlighted item
  useEffect(() => {
    if (highlightedIndex >= 0 && highlightedItemRef.current && dropdownRef.current) {
      const highlightedElement = highlightedItemRef.current;
      const container = dropdownRef.current.querySelector('.max-h-40');
      
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = highlightedElement.getBoundingClientRect();
        
        if (elementRect.bottom > containerRect.bottom) {
          // Scroll down
          container.scrollTop += elementRect.bottom - containerRect.bottom + 8;
        } else if (elementRect.top < containerRect.top) {
          // Scroll up
          container.scrollTop -= containerRect.top - elementRect.top + 8;
        }
      }
    }
  }, [highlightedIndex]);

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-64"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header with multi-select toggle */}
      <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700">
          Select {multiSelectMode ? 'values' : 'value'}
        </span>
        <button
          type="button"
          onClick={toggleMultiSelectMode}
          className="text-xs text-primary-600 hover:text-primary-700"
        >
          {multiSelectMode ? 'Single select' : 'Multi select'}
        </button>
      </div>

      {/* Search input */}
      <div className="p-2">
        <input
          type="text"
          placeholder="Search or type value..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          autoFocus
        />
      </div>

      {/* Multi-select indicators */}
      {multiSelectMode && selectedValues.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-200">
          <div className="text-xs text-gray-600 mb-1">
            Selected ({selectedValues.length}):
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedValues.map((value) => (
              <span
                key={value}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded"
              >
                {value}
                <button
                  type="button"
                  onClick={() => {
                    const newValues = selectedValues.filter(v => v !== value);
                    setSelectedValues(newValues);
                  }}
                  className="text-primary-500 hover:text-primary-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions list */}
      <div className="max-h-40 overflow-y-auto">
        {loading ? (
          <div className="p-3 text-center text-sm text-gray-500">
            Loading...
          </div>
        ) : filteredSuggestions.length > 0 ? (
          filteredSuggestions.map((suggestion, index) => {
            const isHighlighted = index === highlightedIndex;
            const isSelected = selectedValues.includes(suggestion);
            
            return (
              <button
                key={suggestion}
                ref={isHighlighted ? highlightedItemRef : null}
                type="button"
                className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between ${
                  isHighlighted ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
                } ${
                  isSelected ? 'bg-primary-50 text-primary-700' : ''
                }`}
                onClick={() => handleValueSelect(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span>{suggestion}</span>
                {multiSelectMode && isSelected && (
                  <span className="text-primary-500">✓</span>
                )}
              </button>
            );
          })
        ) : inputValue ? (
          <div className="p-3">
            <button
              type="button"
              className="w-full px-2 py-1 text-left text-sm text-gray-600 hover:bg-gray-100 rounded"
              onClick={() => handleValueSelect(inputValue)}
            >
              Use "{inputValue}"
            </button>
          </div>
        ) : (
          <div className="p-3 text-center text-sm text-gray-500">
            No suggestions available
          </div>
        )}
      </div>

      {/* Multi-select footer */}
      {multiSelectMode && (
        <div className="px-3 py-2 border-t border-gray-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyMultiSelect}
            className="px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}