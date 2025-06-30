import React, { useRef } from 'react';
import { useSearchQueryBuilder } from './SearchQueryBuilder';
import { FilterToken } from './tokens/FilterToken';
import { FreeTextToken } from './tokens/FreeTextToken';
import { BooleanToken } from './tokens/BooleanToken';
import { ParenToken } from './tokens/ParenToken';
import { InterTokenInput } from './InterTokenInput';

interface TokenizedQueryGridProps {
  placeholder?: string;
  disabled?: boolean;
}

export function TokenizedQueryGrid({ placeholder, disabled }: TokenizedQueryGridProps) {
  const { state, setFocusState } = useSearchQueryBuilder();
  const containerRef = useRef<HTMLDivElement>(null);




  const handleContainerClick = (e: React.MouseEvent) => {
    // Focus the last input when clicking on empty space
    const target = e.target as HTMLElement;
    const isTokenClick = target.closest('[data-testid$="-token"]');
    const isInputClick = target.tagName === 'INPUT' || target.closest('input');
    const isDropdownClick = target.closest('[data-testid="filter-key-dropdown"], [data-testid="value-dropdown"], [data-testid="operator-dropdown"]');
    const isButtonClick = target.tagName === 'BUTTON' || target.closest('button');
    
    // Only handle clicks on the container itself or empty areas
    if (!isTokenClick && !isInputClick && !isDropdownClick && !isButtonClick) {
      // Focus the last input position
      const lastInputIndex = state.tokens.length;
      const currentlyFocusedInput = state.focusState.type === 'input' && state.focusState.inputIndex === lastInputIndex;
      
      if (currentlyFocusedInput) {
        // If the target input is already focused, show dropdown directly
        requestAnimationFrame(() => {
          const lastInput = containerRef.current?.querySelector(`input[data-testid="inter-token-input-${lastInputIndex}"]`) as HTMLInputElement;
          if (lastInput) {
            // Trigger a click event on the input to show dropdown
            const clickEvent = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true,
            });
            lastInput.dispatchEvent(clickEvent);
          }
        });
      } else {
        // Focus the input first
        setFocusState({ type: 'input', inputIndex: lastInputIndex });
        
        // Manually focus the actual input element
        requestAnimationFrame(() => {
          const lastInput = containerRef.current?.querySelector(`input[data-testid="inter-token-input-${lastInputIndex}"]`) as HTMLInputElement;
          if (lastInput) {
            lastInput.focus();
          }
        });
      }
    }
  };

  const renderToken = (token: any, index: number) => {
    const key = `token-${index}`;
    const isFocused = state.focusState.type === 'token-part' && state.focusState.tokenIndex === index;
    
    switch (token.type) {
      case 'filter':
        return (
          <FilterToken
            key={key}
            token={token}
            index={index}
            focused={isFocused}
            focusedPartIndex={isFocused ? state.focusState.partIndex : undefined}
          />
        );
      case 'freeText':
        return (
          <FreeTextToken
            key={key}
            token={token}
            index={index}
            focused={isFocused}
          />
        );
      case 'boolean':
        return (
          <BooleanToken
            key={key}
            token={token}
            index={index}
            focused={isFocused}
          />
        );
      case 'paren':
        return (
          <ParenToken
            key={key}
            token={token}
            index={index}
            focused={isFocused}
          />
        );
      default:
        return null;
    }
  };

  // Render the interlaced inputs and tokens
  const renderContent = () => {
    const elements = [];
    
    // Add input before each token and after the last token
    for (let i = 0; i <= state.tokens.length; i++) {
      const inputFocused = state.focusState.type === 'input' && state.focusState.inputIndex === i;
      const isLastInput = i === state.tokens.length;
      
      elements.push(
        <InterTokenInput
          key={`input-${i}`}
          inputIndex={i}
          focused={inputFocused}
          placeholder={i === 0 && state.tokens.length === 0 ? placeholder : undefined}
          isLast={isLastInput}
        />
      );
      
      // Add token after input (except for the last input)
      if (i < state.tokens.length) {
        elements.push(renderToken(state.tokens[i], i));
      }
    }
    
    return elements;
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex-1 min-h-[40px] p-2 pl-10 pr-10 cursor-text"
      onClick={handleContainerClick}
    >
      <div className="relative z-10 flex flex-wrap items-center gap-1 min-h-[24px]">
        {renderContent()}
      </div>
    </div>
  );
}