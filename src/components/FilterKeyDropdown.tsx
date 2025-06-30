import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchQueryBuilder } from './SearchQueryBuilder';
import { FilterKey } from '@/types';
import { TagIcon, ChevronDownIcon } from './Icons';

interface FilterKeyDropdownProps {
  onSelect: (key: string) => void;
  searchQuery: string;
  onClose: () => void;
  highlightedIndex?: number;
  onHighlightChange?: (index: number) => void;
  width?: number | string;
}

export function FilterKeyDropdown({ onSelect, searchQuery, onClose, highlightedIndex = -1, onHighlightChange, width = 400 }: FilterKeyDropdownProps) {
  const { filterKeys, filterKeySections } = useSearchQueryBuilder();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const highlightedItemRef = useRef<HTMLButtonElement>(null);

  const filteredKeys = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return filterKeys.filter(key => 
      key.key.toLowerCase().includes(query) ||
      key.name.toLowerCase().includes(query)
    );
  }, [filterKeys, searchQuery]);

  const organizedKeys = useMemo(() => {
    if (filterKeySections && filterKeySections.length > 0) {
      return filterKeySections.map(section => ({
        ...section,
        children: section.children.filter(key =>
          filteredKeys.some(fk => fk.key === key.key)
        ),
      })).filter(section => section.children.length > 0);
    }
    
    // Group by kind if no sections provided
    const grouped: Record<string, FilterKey[]> = {};
    filteredKeys.forEach(key => {
      const kind = key.kind || 'field';
      if (!grouped[kind]) {
        grouped[kind] = [];
      }
      grouped[kind].push(key);
    });
    
    return Object.entries(grouped).map(([kind, keys]) => ({
      key: kind,
      label: kind.charAt(0).toUpperCase() + kind.slice(1),
      children: keys,
    }));
  }, [filterKeySections, filteredKeys]);

  const handleKeySelect = (key: string) => {
    onSelect(key);
  };

  // Auto-scroll to highlighted item
  useEffect(() => {
    if (highlightedIndex >= 0 && highlightedItemRef.current && dropdownRef.current) {
      const highlightedElement = highlightedItemRef.current;
      const container = dropdownRef.current.querySelector('.max-h-80');
      
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
        onMouseEnter={() => onHighlightChange?.(index)}
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

  // Create a flat list of filtered keys for keyboard navigation
  const flatFilteredKeys = useMemo(() => {
    const result: FilterKey[] = [];
    organizedKeys.forEach(section => {
      result.push(...section.children);
    });
    return result;
  }, [organizedKeys]);

  if (filteredKeys.length === 0) {
    return (
      <div 
        className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50"
        style={{ width: typeof width === 'number' ? `${width}px` : width }}
      >
        <div className="p-4 text-center text-gray-500 text-sm">
          No filter keys found
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-80 overflow-hidden"
      style={{ width: typeof width === 'number' ? `${width}px` : width }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {false ? ( // Temporarily disable sectioned view for keyboard navigation
        // Sectioned view
        <div className="flex h-full">
          {/* Section tabs */}
          <div className="w-32 bg-gray-50 border-r border-gray-200">
            {organizedKeys.map((section) => (
              <button
                key={section.key}
                type="button"
                className={`w-full px-3 py-2 text-left text-sm border-b border-gray-200 flex items-center justify-between ${
                  selectedSection === section.key
                    ? 'bg-primary-50 text-primary-700 border-primary-200'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedSection(
                  selectedSection === section.key ? null : section.key
                )}
              >
                <span>{section.label}</span>
                <span className="text-xs text-gray-400">
                  {section.children.length}
                </span>
              </button>
            ))}
          </div>
          
          {/* Keys list */}
          <div className="flex-1 overflow-y-auto">
            {selectedSection ? (
              organizedKeys
                .find(section => section.key === selectedSection)
                ?.children.map(renderFilterKey)
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                Select a category to view filter keys
              </div>
            )}
          </div>
        </div>
      ) : (
        // Simple list view
        <div className="max-h-80 overflow-y-auto">
          {flatFilteredKeys.map((filterKey, index) => renderFilterKey(filterKey, index))}
        </div>
      )}
      
      {searchQuery && (
        <div className="border-t border-gray-200 p-2 bg-gray-50">
          <button
            type="button"
            className="w-full px-2 py-1 text-left text-xs text-gray-600 hover:bg-gray-100 rounded"
            onClick={() => handleKeySelect(searchQuery)}
          >
            Use "{searchQuery}" as filter key
          </button>
        </div>
      )}
    </div>
  );
}