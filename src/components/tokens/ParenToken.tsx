import React, { useRef, useEffect } from 'react';
import { ParenToken as ParenTokenType } from '@/types';
import { useSearchQueryBuilder } from '../SearchQueryBuilder';
import { XIcon } from '../Icons';

interface ParenTokenProps {
  token: ParenTokenType;
  index: number;
  focused: boolean;
}

export function ParenToken({ token, index, focused }: ParenTokenProps) {
  const { removeToken, setFocusState, moveFocus } = useSearchQueryBuilder();
  const tokenRef = useRef<HTMLDivElement>(null);

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
        border transition-colors cursor-pointer font-mono font-bold
        ${focused
          ? 'border-orange-500 bg-orange-50 text-orange-700'
          : 'border-orange-300 bg-orange-100 text-orange-600 hover:bg-orange-200'
        }
        ${token.invalid ? 'border-red-500 bg-red-50' : ''}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      data-testid="paren-token"
    >
      <span className="text-lg leading-none">
        {token.value}
      </span>

      <button
        type="button"
        className="ml-1 text-orange-400 hover:text-red-500 p-0.5 rounded"
        onClick={(e) => {
          e.stopPropagation();
          handleRemove();
        }}
        aria-label="Remove parenthesis"
      >
        <XIcon className="w-3 h-3" />
      </button>
    </div>
  );
}