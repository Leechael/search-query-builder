import React, { useState, useRef, useEffect } from 'react';
import { OPERATORS } from '@/utils/parser';

interface OperatorDropdownProps {
  currentOperator: string;
  onSelect: (operator: string) => void;
  onClose: () => void;
  autoFocus?: boolean;
}

const OPERATOR_OPTIONS = [
  { value: OPERATORS.EQUAL, label: 'equals', description: 'Exact match' },
  { value: OPERATORS.NOT_EQUAL, label: 'does not equal', description: 'Not an exact match' },
  { value: OPERATORS.CONTAINS, label: 'contains', description: 'Contains the text' },
  { value: OPERATORS.DOES_NOT_CONTAIN, label: 'does not contain', description: 'Does not contain the text' },
  { value: OPERATORS.STARTS_WITH, label: 'starts with', description: 'Begins with the text' },
  { value: OPERATORS.ENDS_WITH, label: 'ends with', description: 'Ends with the text' },
  { value: OPERATORS.GREATER_THAN, label: 'greater than', description: 'Numerically greater' },
  { value: OPERATORS.GREATER_THAN_EQUAL, label: 'greater than or equal', description: 'Numerically greater or equal' },
  { value: OPERATORS.LESS_THAN, label: 'less than', description: 'Numerically less' },
  { value: OPERATORS.LESS_THAN_EQUAL, label: 'less than or equal', description: 'Numerically less or equal' },
];

export function OperatorDropdown({ currentOperator, onSelect, onClose, autoFocus = true }: OperatorDropdownProps) {
  const [highlightedIndex, setHighlightedIndex] = useState(() => {
    // Find current operator index or default to 0
    const currentIndex = OPERATOR_OPTIONS.findIndex(op => op.value === currentOperator);
    return currentIndex >= 0 ? currentIndex : 0;
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const highlightedItemRef = useRef<HTMLButtonElement>(null);

  const handleSelect = (operator: string) => {
    onSelect(operator);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < OPERATOR_OPTIONS.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev > 0 ? prev - 1 : OPERATOR_OPTIONS.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(OPERATOR_OPTIONS[highlightedIndex].value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Auto-focus and auto-scroll
  useEffect(() => {
    if (autoFocus && dropdownRef.current) {
      dropdownRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (highlightedIndex >= 0 && highlightedItemRef.current && dropdownRef.current) {
      const highlightedElement = highlightedItemRef.current;
      const container = dropdownRef.current.querySelector('.py-1');
      
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

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 min-w-48"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="py-1 max-h-64 overflow-y-auto">
        {OPERATOR_OPTIONS.map((option, index) => {
          const isHighlighted = index === highlightedIndex;
          const isCurrent = currentOperator === option.value;
          
          return (
            <button
              key={option.value}
              ref={isHighlighted ? highlightedItemRef : null}
              type="button"
              className={`w-full px-3 py-2 text-left text-sm flex flex-col ${
                isHighlighted ? 'bg-primary-100 text-primary-900' : 
                isCurrent ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-100'
              }`}
              onClick={() => handleSelect(option.value)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-gray-500 mt-0.5">{option.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}