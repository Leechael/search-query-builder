import React, { useRef, useEffect } from 'react';
import { useSearchQueryBuilder } from './SearchQueryBuilder';

interface PlainTextInputProps {
  placeholder?: string;
  disabled?: boolean;
}

export function PlainTextInput({ placeholder, disabled }: PlainTextInputProps) {
  const { state, setQuery, search } = useSearchQueryBuilder();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      search();
    }
  };

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== state.query) {
      inputRef.current.value = state.query;
    }
  }, [state.query]);

  return (
    <input
      ref={inputRef}
      type="text"
      className="w-full h-10 pl-10 pr-10 border-0 outline-none bg-transparent text-sm placeholder-gray-400 disabled:cursor-not-allowed"
      placeholder={placeholder}
      disabled={disabled}
      defaultValue={state.query}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      data-testid="plain-text-input"
    />
  );
}