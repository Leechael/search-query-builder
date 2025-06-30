import React, { useState, useRef, useEffect } from 'react';
import { useSearchQueryBuilder } from './SearchQueryBuilder';
import { FilterKeyDropdownEnhanced } from './FilterKeyDropdownEnhanced';

interface InterTokenInputProps {
  inputIndex: number;
  focused: boolean;
  placeholder?: string;
  isLast?: boolean;
}

export function InterTokenInput({ inputIndex, focused, placeholder, isLast = false }: InterTokenInputProps) {
  const { 
    state, 
    addToken, 
    setFocusState, 
    setActiveDropdown, 
    moveFocus, 
    filterKeys,
    setDropdownSearchQuery,
    setDropdownHighlightedIndex,
    setDropdownInputIndex
  } = useSearchQueryBuilder();
  const [inputValue, setInputValue] = useState('');
  const [hasFocus, setHasFocus] = useState(false);
  const [dropdownRequested, setDropdownRequested] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const showDropdown = state.activeDropdown.type === 'filter-key' && 
    dropdownRequested;
    
    
    
  
  // Filter available filter keys based on input
  const filteredFilterKeys = filterKeys?.filter(key => {
    // If input is empty, show all keys
    if (!inputValue.trim()) return true;
    
    return key.key.toLowerCase().includes(inputValue.toLowerCase()) ||
           key.name.toLowerCase().includes(inputValue.toLowerCase());
  }) || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setDropdownSearchQuery(value);
    setDropdownHighlightedIndex(-1);
    
    // Auto-show dropdown when typing (if dropdown was already requested)
    if (value.length > 0 && dropdownRequested) {
      setActiveDropdown({ type: 'filter-key' });
    }
    
    // Auto-complete filter if it looks like a filter (contains :)
    if (value.includes(':') && !value.endsWith(':')) {
      const [key, ...valueParts] = value.split(':');
      const filterValue = valueParts.join(':');
      if (key && filterValue) {
        // Add filter at current position
        addToken({
          key: `filter_${Date.now()}`,
          type: 'filter',
          filterKey: key,
          operator: '=',
          value: filterValue,
        } as any, inputIndex);
        setInputValue('');
        setActiveDropdown({ type: null });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle navigation even when dropdown is open
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const input = e.currentTarget;
      const atStart = input.selectionStart === 0;
      const atEnd = input.selectionStart === input.value.length;
      
      if (e.key === 'ArrowLeft' && (atStart || input.value === '')) {
        e.preventDefault();
        moveFocus('left');
        return;
      } else if (e.key === 'ArrowRight' && (atEnd || input.value === '')) {
        e.preventDefault();
        moveFocus('right');
        return;
      }
      
      // Clear dropdown selection if navigating within text
      if (showDropdown && highlightedIndex >= 0) {
        setHighlightedIndex(-1);
      }
      return;
    }
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      
      // Always ensure we're focused and have filter keys available
      if (filteredFilterKeys.length === 0) return;
      
      // If dropdown is not shown yet, request and show it
      if (!showDropdown) {
        setDropdownRequested(true);
        setActiveDropdown({ type: 'filter-key' });
        setDropdownInputIndex(inputIndex);
        setDropdownSearchQuery(inputValue);
        // Set highlighting immediately 
        setDropdownHighlightedIndex(0);
      } else {
        // Navigate within dropdown
        setDropdownHighlightedIndex(prev => 
          prev < filteredFilterKeys.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      
      // Always ensure we're focused and have filter keys available
      if (filteredFilterKeys.length === 0) return;
      
      // If dropdown is not shown yet, request and show it
      if (!showDropdown) {
        setDropdownRequested(true);
        setActiveDropdown({ type: 'filter-key' });
        setDropdownInputIndex(inputIndex);
        setDropdownSearchQuery(inputValue);
        // Set highlighting immediately
        setDropdownHighlightedIndex(filteredFilterKeys.length - 1);
      } else {
        // Navigate within dropdown
        setDropdownHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredFilterKeys.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (showDropdown && filteredFilterKeys.length > 0) {
        // This will be handled by the dropdown component now
      } else if (inputValue.trim()) {
        // Add as free text or filter
        if (inputValue.includes(':')) {
          const [key, ...valueParts] = inputValue.split(':');
          const value = valueParts.join(':');
          if (key && value) {
            addToken({
              key: `filter_${Date.now()}`,
              type: 'filter',
              filterKey: key,
              operator: '=',
              value,
            } as any, inputIndex);
          }
        } else {
          // Add as free text
          addToken({
            key: `freetext_${Date.now()}`,
            type: 'freeText',
            value: inputValue.trim(),
          }, inputIndex);
        }
        setInputValue('');
        setActiveDropdown({ type: null });
      }
    } else if (e.key === 'Escape') {
      if (showDropdown) {
        // First Escape: close dropdown
        setActiveDropdown({ type: null });
        setDropdownRequested(false);
        setHighlightedIndex(-1);
      } else {
        // Second Escape: blur input and clear
        setInputValue('');
        setDropdownRequested(false);
        inputRef.current?.blur();
      }
    } else if (e.key === 'Backspace' && inputValue === '' && inputIndex > 0) {
      // Delete previous token when backspacing on empty input
      // Focus the last part of the previous token and trigger its deletion
      setFocusState({
        type: 'token-part',
        tokenIndex: inputIndex - 1,
        partIndex: 3 // delete button
      });
    }
  };


  const handleFocus = () => {
    setHasFocus(true);
    setFocusState({ type: 'input', inputIndex });
    // Don't auto-show dropdown on focus anymore
  };

  const handleClick = () => {
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    
    if (hasFocus && !showDropdown) {
      // If already focused and dropdown not showing, request it
      setDropdownRequested(true);
      setActiveDropdown({ type: 'filter-key' });
      setDropdownInputIndex(inputIndex);
      setDropdownSearchQuery(inputValue);
      // Set highlighting immediately
      setDropdownHighlightedIndex(0);
    } else if (!hasFocus) {
      // If not focused, focus first then show dropdown on next click
      setHasFocus(true);
      setFocusState({ type: 'input', inputIndex });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setHasFocus(false);
    
    // Clear any existing close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    
    // Set a new close timeout
    closeTimeoutRef.current = window.setTimeout(() => {
      // Check if focus is still on this input or if dropdown is being interacted with
      const dropdownElement = document.querySelector('[data-testid="filter-key-dropdown-enhanced"]');
      const containerElement = document.querySelector('[data-testid="search-query-builder"]');
      const focusedElement = document.activeElement;
      
      // Close dropdown if focus has moved away from input, dropdown, and container
      const focusInInput = inputRef.current === focusedElement;
      const focusInDropdown = dropdownElement && dropdownElement.contains(focusedElement);
      const focusInContainer = containerElement && containerElement.contains(focusedElement);
      
      if (!focusInInput && !focusInDropdown && !focusInContainer) {
        setDropdownRequested(false);
        setActiveDropdown({ type: null });
        setDropdownInputIndex(null);
      }
      closeTimeoutRef.current = null;
    }, 150);
  };

  // Auto-focus when this input becomes focused
  useEffect(() => {
    if (focused && inputRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          setHasFocus(true);
        }
      });
    }
  }, [focused]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Calculate input width
  const getInputWidth = () => {
    if (isLast) {
      // Last input should expand to fill remaining space
      return inputValue ? Math.max(100, inputValue.length * 8 + 20) + 'px' : '100px';
    } else {
      // Inter-token inputs should be minimal (1px when empty, auto-size when typing)
      return inputValue ? Math.max(20, inputValue.length * 8 + 10) + 'px' : '1px';
    }
  };

  const inputClassName = isLast 
    ? "flex-1 min-w-[100px] border-0 outline-none bg-transparent text-sm placeholder-gray-400 disabled:cursor-not-allowed"
    : "border-0 outline-none bg-transparent text-sm placeholder-gray-400 disabled:cursor-not-allowed";

  return (
    <div className={`relative ${isLast ? 'flex-1' : 'inline-block'}`}>
      <input
        ref={inputRef}
        type="text"
        className={inputClassName}
        placeholder={focused ? placeholder : ''}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        data-testid={`inter-token-input-${inputIndex}`}
        style={isLast ? {} : { width: getInputWidth() }}
      />
      
    </div>
  );
}