import React, { useState, useRef, useEffect } from 'react';
import { useFocusWithin } from 'react-aria';
import { FilterToken as FilterTokenType } from '@/types';
import { useSearchQueryBuilder } from '../SearchQueryBuilder';
import { XIcon, ChevronDownIcon } from '../Icons';
import { ValueDropdown } from '../ValueDropdown';
import { OperatorDropdown } from '../OperatorDropdown';
import { FilterKeyEditDropdown } from '../FilterKeyEditDropdown';
import { Tooltip } from '../Tooltip';

interface FilterTokenProps {
  token: FilterTokenType;
  index: number;
  focused: boolean;
  focusedPartIndex?: number;
}

export function FilterToken({ token, index, focused, focusedPartIndex }: FilterTokenProps) {
  const { updateToken, removeToken, setFocusState, state, setActiveDropdown, moveFocus } = useSearchQueryBuilder();
  const [isEditing, setIsEditing] = useState(false);
  const [editingPart, setEditingPart] = useState<'key' | 'operator' | 'value' | null>(null);
  
  const showKeyDropdown = state.activeDropdown.type === 'filter-key' && state.activeDropdown.tokenIndex === index;
  const showValueDropdown = state.activeDropdown.type === 'value' && state.activeDropdown.tokenIndex === index;
  const showOperatorDropdown = state.activeDropdown.type === 'operator' && state.activeDropdown.tokenIndex === index;
  const tokenRef = useRef<HTMLDivElement>(null);
  
  // Focus management within the token
  const { focusWithinProps } = useFocusWithin({
    onBlurWithin: () => {
      setIsEditing(false);
      setEditingPart(null);
      setActiveDropdown({ type: null });
    },
  });
  
  // Create a ref for the container
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyEdit = (newKey: string) => {
    updateToken(index, { ...token, filterKey: newKey } as FilterTokenType);
    setEditingPart(null);
    setActiveDropdown({ type: null });
    // Keep focus on the key button after editing
    setTimeout(() => {
      const keyButton = containerRef.current?.querySelector('[data-part="key"]') as HTMLElement;
      keyButton?.focus();
    }, 0);
  };

  const handleOperatorEdit = (newOperator: string) => {
    updateToken(index, { ...token, operator: newOperator });
    setEditingPart(null);
    setActiveDropdown({ type: null });
    // Keep focus on the operator button after editing
    setTimeout(() => {
      const operatorButton = containerRef.current?.querySelector('[data-part="operator"]') as HTMLElement;
      operatorButton?.focus();
    }, 0);
  };

  const handleValueEdit = (newValue: string | string[]) => {
    updateToken(index, { ...token, value: newValue });
    
    // Only close dropdown in single-select mode (when value is a string)
    // In multi-select mode, let the ValueDropdown handle its own closing
    if (typeof newValue === 'string') {
      setEditingPart(null);
      setActiveDropdown({ type: null });
      // Keep focus on the value button after editing
      setTimeout(() => {
        const valueButton = containerRef.current?.querySelector('[data-part="value"]') as HTMLElement;
        valueButton?.focus();
      }, 0);
    }
  };

  const handleRemove = () => {
    removeToken(index);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering container click
    setFocusState({ type: 'token-part', tokenIndex: index, partIndex: 0 });
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle navigation directly
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      moveFocus(e.key === 'ArrowLeft' ? 'left' : 'right');
      return;
    }
    
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      handleRemove();
    }
    // Note: Escape handling is now done by individual dropdowns to maintain focus on the correct button
  };

  // Auto-focus the specific part when token becomes focused
  useEffect(() => {
    if (focused && focusedPartIndex !== undefined && containerRef.current) {
      const partSelectors = ['[data-part="key"]', '[data-part="operator"]', '[data-part="value"]', '[data-part="remove"]'];
      const targetElement = containerRef.current.querySelector(partSelectors[focusedPartIndex]) as HTMLElement;
      if (targetElement) {
        targetElement.focus();
        setIsEditing(true);
      }
    }
  }, [focused, focusedPartIndex]);

  const displayValue = Array.isArray(token.value) 
    ? `[${token.value.join(', ')}]` 
    : String(token.value);

  const operatorDisplay = token.negated ? `!${token.operator}` : token.operator;

  // Combine refs
  const combinedRef = (node: HTMLDivElement) => {
    tokenRef.current = node;
    containerRef.current = node;
  };

  return (
    <div
      ref={combinedRef}
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs
        border transition-colors cursor-pointer
        ${focused || isEditing
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }
        ${token.invalid ? 'border-red-500 bg-red-50' : ''}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={!isEditing ? 0 : -1}
      data-testid="filter-token"
      {...focusWithinProps}
    >
      {/* Filter Key */}
      <Tooltip title={`Edit filter key: ${token.filterKey}`}>
        <button
          type="button"
          data-part="key"
          className="font-medium text-primary-700 cursor-pointer hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded px-1"
          onClick={(e) => {
            e.stopPropagation();
            setActiveDropdown({ type: 'filter-key', tokenIndex: index });
            setEditingPart('key');
            setIsEditing(true);
          }}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              setActiveDropdown({ type: 'filter-key', tokenIndex: index });
              setEditingPart('key');
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
              e.preventDefault();
              moveFocus(e.key === 'ArrowLeft' ? 'left' : 'right');
            }
          }}
          tabIndex={isEditing ? 0 : -1}
          aria-label={`Edit filter key: ${token.filterKey}`}
        >
          {token.filterKey}
        </button>
      </Tooltip>

      {/* Operator */}
      <Tooltip title={`Edit operator: ${operatorDisplay}`}>
        <button
          type="button"
          data-part="operator"
          className="text-gray-500 cursor-pointer hover:text-gray-700 flex items-center gap-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded px-1"
          onClick={(e) => {
            e.stopPropagation();
            setActiveDropdown({ type: 'operator', tokenIndex: index });
            setEditingPart('operator');
            setIsEditing(true);
          }}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              setActiveDropdown({ type: 'operator', tokenIndex: index });
              setEditingPart('operator');
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
              e.preventDefault();
              moveFocus(e.key === 'ArrowLeft' ? 'left' : 'right');
            }
          }}
          tabIndex={isEditing ? 0 : -1}
          aria-label={`Edit operator: ${operatorDisplay}`}
        >
          {operatorDisplay}
          <ChevronDownIcon className="w-3 h-3" />
        </button>
      </Tooltip>

      {/* Value */}
      <Tooltip title={`Edit value: ${displayValue}`}>
        <button
          type="button"
          data-part="value"
          className="text-gray-900 cursor-pointer hover:text-gray-700 flex items-center gap-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded px-1"
          onClick={(e) => {
            e.stopPropagation();
            setActiveDropdown({ type: 'value', tokenIndex: index });
            setEditingPart('value');
            setIsEditing(true);
          }}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              setActiveDropdown({ type: 'value', tokenIndex: index });
              setEditingPart('value');
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
              e.preventDefault();
              moveFocus(e.key === 'ArrowLeft' ? 'left' : 'right');
            }
          }}
          tabIndex={isEditing ? 0 : -1}
          aria-label={`Edit value: ${displayValue}`}
        >
          {displayValue}
          <ChevronDownIcon className="w-3 h-3" />
        </button>
      </Tooltip>

      {/* Remove button */}
      <button
        type="button"
        data-part="remove"
        className="ml-1 text-gray-400 hover:text-red-500 p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
        onClick={(e) => {
          e.stopPropagation();
          handleRemove();
        }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleRemove();
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            moveFocus(e.key === 'ArrowLeft' ? 'left' : 'right');
          }
        }}
        tabIndex={isEditing ? 0 : -1}
        aria-label="Remove filter"
      >
        <XIcon className="w-3 h-3" />
      </button>

      {/* Dropdowns */}
      {showKeyDropdown && editingPart === 'key' && (
        <FilterKeyEditDropdown
          currentKey={token.filterKey}
          onSelect={handleKeyEdit}
          onClose={() => {
            setActiveDropdown({ type: null });
            setEditingPart(null);
            // Keep focus on the key button when closing
            setTimeout(() => {
              const keyButton = containerRef.current?.querySelector('[data-part="key"]') as HTMLElement;
              keyButton?.focus();
            }, 0);
          }}
        />
      )}

      {showOperatorDropdown && editingPart === 'operator' && (
        <OperatorDropdown
          currentOperator={token.operator}
          onSelect={handleOperatorEdit}
          onClose={() => {
            setActiveDropdown({ type: null });
            setEditingPart(null);
            // Keep focus on the operator button when closing
            setTimeout(() => {
              const operatorButton = containerRef.current?.querySelector('[data-part="operator"]') as HTMLElement;
              operatorButton?.focus();
            }, 0);
          }}
        />
      )}

      {showValueDropdown && editingPart === 'value' && (
        <ValueDropdown
          filterKey={token.filterKey}
          currentValue={token.value}
          onSelect={handleValueEdit}
          onClose={() => {
            setActiveDropdown({ type: null });
            setEditingPart(null);
            // Keep focus on the value button when closing
            setTimeout(() => {
              const valueButton = containerRef.current?.querySelector('[data-part="value"]') as HTMLElement;
              valueButton?.focus();
            }, 0);
          }}
        />
      )}
    </div>
  );
}