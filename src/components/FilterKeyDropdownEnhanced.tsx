import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchQueryBuilder } from './SearchQueryBuilder';
import { FilterKey } from '@/types';
import { TagIcon, ClockIcon } from './Icons';

interface FilterKeyDropdownEnhancedProps {
  onSelect: (key: string) => void;
  searchQuery?: string;
  onClose: () => void;
  highlightedIndex: number;
  onHighlightChange: (index: number) => void;
  width?: number | string;
}

interface Section {
  key: string;
  label: string;
  items: FilterKey[];
}

// Recent searches - persisted in localStorage
const RECENT_SEARCHES_KEY = 'sentry-search-recent-keys';
const MAX_RECENT_SEARCHES = 10;

const getRecentSearches = (): FilterKey[] => {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const addRecentSearch = (filterKey: FilterKey) => {
  try {
    const recent = getRecentSearches();
    const updated = [
      filterKey,
      ...recent.filter(item => item.key !== filterKey.key)
    ].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
};

export function FilterKeyDropdownEnhanced({ 
  onSelect, 
  searchQuery = '', 
  onClose, 
  highlightedIndex, 
  onHighlightChange,
  width = 400 
}: FilterKeyDropdownEnhancedProps) {
  const { filterKeys, filterKeySections } = useSearchQueryBuilder();
  const [recentSearches, setRecentSearches] = useState<FilterKey[]>(() => getRecentSearches());
  const [selectedTab, setSelectedTab] = useState(() => {
    // Start with 'recent' but auto-switch to first available tab if recent is empty
    return 'recent';
  });
  const [justOpened, setJustOpened] = useState(true);
  const [userSelectedTab, setUserSelectedTab] = useState(false); // Track if user manually selected a tab
  const dropdownRef = useRef<HTMLDivElement>(null);
  const highlightedItemRef = useRef<HTMLButtonElement>(null);

  // Organize filter keys into sections
  const sections = useMemo(() => {
    if (!filterKeys) return [];

    // Filter recent searches based on search query and available keys
    const filteredRecentSearches = recentSearches.filter(recent => {
      const matchesQuery = searchQuery === '' || 
        recent.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recent.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Only show recent searches that are still available in current filter keys
      const stillAvailable = filterKeys.some(key => key.key === recent.key);
      return matchesQuery && stillAvailable;
    });

    const recentSection: Section = {
      key: 'recent',
      label: 'Recent',
      items: filteredRecentSearches
    };

    // Filter all keys based on search query
    const filteredAllKeys = filterKeys.filter(key => 
      key.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const allSection: Section = {
      key: 'all',
      label: 'All',
      items: filteredAllKeys
    };

    // Group by sections if available (following Sentry's pattern)
    const groupedSections: Section[] = [];
    if (filterKeySections) {
      filterKeySections.forEach(section => {
        const sectionItems = section.children
          .filter(key => 
            key.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
            key.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        
        if (sectionItems.length > 0) {
          groupedSections.push({
            key: section.key,
            label: section.label,
            items: sectionItems
          });
        }
      });
    }

    // If no sections defined, return just Recent and All
    if (groupedSections.length === 0) {
      return [recentSection, allSection];
    }

    return [recentSection, ...groupedSections];
  }, [filterKeys, filterKeySections, searchQuery, recentSearches]);

  // Auto-switch to best tab when search query changes (but respect user selection)
  useEffect(() => {
    if (sections.length === 0) return;
    
    if (searchQuery) {
      // If searching, prefer tabs with actual results (override user selection for search)
      const bestSection = sections.find(section => section.items.length > 0);
      if (bestSection && bestSection.key !== selectedTab) {
        setSelectedTab(bestSection.key);
        onHighlightChange(0); // Reset highlighting when switching tabs
        setUserSelectedTab(false); // Reset user selection flag when auto-switching for search
      }
    } else if (!userSelectedTab) {
      // Only auto-switch when not searching AND user hasn't manually selected a tab
      const recentSection = sections.find(s => s.key === 'recent');
      if (recentSection && recentSection.items.length > 0) {
        if (selectedTab !== 'recent') {
          setSelectedTab('recent');
          onHighlightChange(0); // Reset highlighting when switching tabs
        }
      } else {
        // Recent is empty, switch to first tab with items
        const firstAvailableSection = sections.find(section => section.items.length > 0);
        if (firstAvailableSection && firstAvailableSection.key !== selectedTab) {
          setSelectedTab(firstAvailableSection.key);
          onHighlightChange(0); // Reset highlighting when switching tabs
        }
      }
    }
  }, [searchQuery, sections, selectedTab, onHighlightChange, userSelectedTab]);

  const currentSection = sections.find(section => section.key === selectedTab);
  const flatItems = currentSection?.items || [];

  const handleKeySelect = (key: string) => {
    // Add to recent searches
    const selectedKey = filterKeys?.find(k => k.key === key);
    if (selectedKey) {
      addRecentSearch(selectedKey);
      setRecentSearches(getRecentSearches());
    }
    
    onSelect(key);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ignore arrow keys if the dropdown just opened to prevent double handling
    if (justOpened && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (flatItems.length > 0) {
        onHighlightChange(highlightedIndex < flatItems.length - 1 ? highlightedIndex + 1 : 0);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (flatItems.length > 0) {
        onHighlightChange(highlightedIndex > 0 ? highlightedIndex - 1 : flatItems.length - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const currentIndex = sections.findIndex(s => s.key === selectedTab);
      const newIndex = currentIndex > 0 ? currentIndex - 1 : sections.length - 1;
      setSelectedTab(sections[newIndex].key);
      onHighlightChange(0);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const currentIndex = sections.findIndex(s => s.key === selectedTab);
      const newIndex = currentIndex < sections.length - 1 ? currentIndex + 1 : 0;
      setSelectedTab(sections[newIndex].key);
      onHighlightChange(0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && flatItems[highlightedIndex]) {
        handleKeySelect(flatItems[highlightedIndex].key);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Auto-focus dropdown but keep parent container in focus-within state
  useEffect(() => {
    if (dropdownRef.current) {
      // Focus the dropdown but ensure it's still considered "within" the parent container
      dropdownRef.current.focus();
    }
  }, []);

  // Clear justOpened flag after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setJustOpened(false);
    }, 50); // Short delay to allow arrow key event to complete
    return () => clearTimeout(timer);
  }, []);

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
    const isRecent = selectedTab === 'recent';
    
    // Determine the kind/type for better visual grouping
    const getKindDisplay = (kind: string) => {
      switch (kind) {
        case 'string': return 'text';
        case 'number': return 'num';
        case 'boolean': return 'bool';
        case 'date': return 'date';
        default: return kind;
      }
    };
    
    return (
      <button
        key={filterKey.key}
        ref={isHighlighted ? highlightedItemRef : null}
        type="button"
        className={`w-full px-3 py-2 text-left text-sm flex items-start gap-3 transition-colors ${
          isHighlighted ? 'bg-primary-100 text-primary-900' : 'hover:bg-gray-100'
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleKeySelect(filterKey.key);
        }}
        onMouseDown={(e) => {
          // Prevent blur on input when clicking items
          e.preventDefault();
        }}
        onMouseEnter={() => onHighlightChange(index)}
      >
        <div className="flex-shrink-0 mt-0.5">
          {isRecent ? (
            <ClockIcon className="w-4 h-4 text-gray-400" />
          ) : (
            <TagIcon className="w-4 h-4 text-gray-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-medium text-gray-900 truncate">{filterKey.name}</div>
            {filterKey.kind && (
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                {getKindDisplay(filterKey.kind)}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 font-mono">{filterKey.key}</div>
          {filterKey.description && (
            <div className="text-xs text-gray-400 mt-1 max-h-8 overflow-hidden">{filterKey.description}</div>
          )}
        </div>
        
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          {filterKey.deprecated && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
              Deprecated
            </span>
          )}
          {isRecent && (
            <span className="text-xs text-gray-400">Recent</span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      data-testid="filter-key-dropdown-enhanced"
    >
      {/* Tabs */}
      <div className="border-b border-gray-200 flex overflow-x-auto">
        {sections.map((section) => {
          const isActive = selectedTab === section.key;
          const hasItems = section.items.length > 0;
          
          return (
            <button
              key={section.key}
              type="button"
              className={`px-3 py-2 text-sm font-medium border-b-2 flex-shrink-0 transition-colors ${
                isActive
                  ? 'border-primary-500 text-primary-600 bg-primary-50'
                  : hasItems
                  ? 'border-transparent text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  : 'border-transparent text-gray-400 cursor-not-allowed'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (hasItems) {
                  setUserSelectedTab(true); // Mark as user-selected
                  setSelectedTab(section.key);
                  onHighlightChange(0);
                }
              }}
              onMouseDown={(e) => {
                // Don't prevent default here as it blocks the click event
                // The onClick handler already has stopPropagation to prevent blur
              }}
              disabled={!hasItems}
            >
              <div className="flex items-center gap-1">
                {section.key === 'recent' && (
                  <ClockIcon className="w-3 h-3" />
                )}
                <span>{section.label}</span>
                {hasItems && (
                  <span className={`text-xs ${isActive ? 'text-primary-500' : 'text-gray-400'}`}>
                    ({section.items.length})
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {flatItems.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {searchQuery ? `No filter keys found for "${searchQuery}"` : 'No filter keys available'}
          </div>
        ) : (
          <div className="py-1">
            {flatItems.map((filterKey, index) => renderFilterKey(filterKey, index))}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="border-t border-gray-200 px-3 py-2 text-xs text-gray-500 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>←→ Switch tabs</span>
            <span>↵ Select</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Esc Close</span>
            {flatItems.length > 0 && (
              <span className="text-gray-400">•</span>
            )}
            {flatItems.length > 0 && (
              <span>{flatItems.length} filter{flatItems.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}