import React, { useRef, useEffect } from 'react';
import { BooleanToken as BooleanTokenType } from '@/types';
import { useSearchQueryBuilder } from '../SearchQueryBuilder';
import { XIcon } from '../Icons';

interface BooleanTokenProps {
  token: BooleanTokenType;
  index: number;
  focused: boolean;
}

export function BooleanToken({ token, index, focused }: BooleanTokenProps) {
  const { updateToken, removeToken, setFocusState, moveFocus } = useSearchQueryBuilder();
  const tokenRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    const newValue = token.value === 'AND' ? 'OR' : 'AND';
    updateToken(index, { ...token, value: newValue });
  };

  const handleRemove = () => {
    removeToken(index);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering container click
    setFocusState({ type: 'token-part', tokenIndex: index, partIndex: 0 });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle horizontal navigation
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      moveFocus(e.key === 'ArrowLeft' ? 'left' : 'right');
      return;
    }
    
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      handleRemove();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  // Auto-focus when token becomes focused
  useEffect(() => {
    if (focused && tokenRef.current) {
      tokenRef.current.focus();
    }
  }, [focused]);

  return (
    <div
      ref={tokenRef}
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs
        border transition-colors cursor-pointer font-medium
        ${focused
          ? 'border-purple-500 bg-purple-50 text-purple-700'
          : 'border-purple-300 bg-purple-100 text-purple-600 hover:bg-purple-200'
        }
        ${token.invalid ? 'border-red-500 bg-red-50' : ''}}
      `}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      data-testid="boolean-token"
      title={`Click to toggle to ${token.value === 'AND' ? 'OR' : 'AND'}`}
    >
      <span>
        {token.value}
      </span>

      <button
        type="button"
        className="ml-1 text-purple-400 hover:text-red-500 p-0.5 rounded"
        onClick={(e) => {
          e.stopPropagation();
          handleRemove();
        }}
        aria-label="Remove boolean operator"
      >
        <XIcon className="w-3 h-3" />
      </button>
    </div>
  );
}