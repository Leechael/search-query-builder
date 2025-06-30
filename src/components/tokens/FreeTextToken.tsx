import React, { useState, useRef, useEffect } from 'react';
import { FreeTextToken as FreeTextTokenType } from '@/types';
import { useSearchQueryBuilder } from '../SearchQueryBuilder';
import { XIcon } from '../Icons';

interface FreeTextTokenProps {
  token: FreeTextTokenType;
  index: number;
  focused: boolean;
}

export function FreeTextToken({ token, index, focused }: FreeTextTokenProps) {
  const { updateToken, removeToken, setFocusState, moveFocus } = useSearchQueryBuilder();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(token.value));
  const inputRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef<HTMLDivElement>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(String(token.value));
  };

  const handleSave = () => {
    if (editValue.trim()) {
      updateToken(index, { ...token, value: editValue.trim() });
    } else {
      removeToken(index);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String(token.value));
    setIsEditing(false);
  };

  const handleRemove = () => {
    removeToken(index);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering container click
    setFocusState({ type: 'token-part', tokenIndex: index, partIndex: 0 });
    handleEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isEditing) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    } else {
      // Handle horizontal navigation when not editing
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
        handleEdit();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleInputBlur = () => {
    handleSave();
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tokenRef.current && !tokenRef.current.contains(event.target as Node)) {
        if (isEditing) {
          handleSave();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, editValue]);

  // Auto-focus when token becomes focused
  useEffect(() => {
    if (focused && !isEditing && tokenRef.current) {
      tokenRef.current.focus();
    }
  }, [focused, isEditing]);

  if (isEditing) {
    return (
      <div
        ref={tokenRef}
        className="inline-flex items-center"
      >
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          className="px-2 py-1 text-xs border border-primary-500 rounded-md outline-none focus:ring-2 focus:ring-primary-500"
          data-testid="freetext-input"
        />
      </div>
    );
  }

  return (
    <div
      ref={tokenRef}
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs
        border transition-colors cursor-pointer
        ${focused
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-300 bg-gray-100 hover:bg-gray-200'
        }
        ${token.invalid ? 'border-red-500 bg-red-50' : ''}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      data-testid="freetext-token"
    >
      <span className="text-gray-900">
        {String(token.value)}
      </span>

      <button
        type="button"
        className="ml-1 text-gray-400 hover:text-red-500 p-0.5 rounded"
        onClick={(e) => {
          e.stopPropagation();
          handleRemove();
        }}
        aria-label="Remove text"
      >
        <XIcon className="w-3 h-3" />
      </button>
    </div>
  );
}