import { useCallback, useRef } from 'react';

interface FocusNavigationOptions {
  onFocusNext?: () => void;
  onFocusPrevious?: () => void;
  onFocusOut?: () => void;
}

export function useFocusNavigation(options: FocusNavigationOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const focusableSelector = [
      'button:not([disabled])',
      'input:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');
    
    return Array.from(containerRef.current.querySelectorAll(focusableSelector));
  }, []);

  const focusNext = useCallback(() => {
    const elements = getFocusableElements();
    const currentIndex = elements.findIndex(el => el === document.activeElement);
    
    if (currentIndex === -1) {
      // No current focus, focus first element
      (elements[0] as HTMLElement)?.focus();
    } else if (currentIndex < elements.length - 1) {
      // Focus next element
      (elements[currentIndex + 1] as HTMLElement)?.focus();
    } else {
      // At end of container, focus next container
      options.onFocusNext?.();
    }
  }, [getFocusableElements, options.onFocusNext]);

  const focusPrevious = useCallback(() => {
    const elements = getFocusableElements();
    const currentIndex = elements.findIndex(el => el === document.activeElement);
    
    if (currentIndex === -1) {
      // No current focus, focus last element
      (elements[elements.length - 1] as HTMLElement)?.focus();
    } else if (currentIndex > 0) {
      // Focus previous element
      (elements[currentIndex - 1] as HTMLElement)?.focus();
    } else {
      // At start of container, focus previous container
      options.onFocusPrevious?.();
    }
  }, [getFocusableElements, options.onFocusPrevious]);

  const focusFirst = useCallback(() => {
    const elements = getFocusableElements();
    (elements[0] as HTMLElement)?.focus();
  }, [getFocusableElements]);

  const focusLast = useCallback(() => {
    const elements = getFocusableElements();
    (elements[elements.length - 1] as HTMLElement)?.focus();
  }, [getFocusableElements]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      // Check if we're in an input and not at the start
      const target = e.target as HTMLInputElement;
      if (target.tagName === 'INPUT' && target.selectionStart !== 0) {
        // Let the input handle cursor movement
        return;
      }
      
      e.preventDefault();
      focusPrevious();
    } else if (e.key === 'ArrowRight') {
      // Check if we're in an input and not at the end
      const target = e.target as HTMLInputElement;
      if (target.tagName === 'INPUT' && target.selectionEnd !== target.value.length) {
        // Let the input handle cursor movement
        return;
      }
      
      e.preventDefault();
      focusNext();
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusFirst();
    } else if (e.key === 'End') {
      e.preventDefault();
      focusLast();
    } else if (e.key === 'Escape') {
      options.onFocusOut?.();
    }
  }, [focusNext, focusPrevious, focusFirst, focusLast, options.onFocusOut]);

  return {
    containerRef,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    handleKeyDown,
    getFocusableElements
  };
}