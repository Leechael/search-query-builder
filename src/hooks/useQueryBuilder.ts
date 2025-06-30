import { useReducer, useCallback, useMemo } from 'react';
import { Token, QueryBuilderState, FilterToken, ApiClient, DropdownState, FocusState } from '@/types';
import { parseQuery, stringifyTokens, generateTokenKey } from '@/utils/parser';

type QueryBuilderAction =
  | { type: 'SET_QUERY'; query: string }
  | { type: 'SET_TOKENS'; tokens: Token[] }
  | { type: 'ADD_TOKEN'; token: Token; position?: number }
  | { type: 'UPDATE_TOKEN'; index: number; token: Token }
  | { type: 'REMOVE_TOKEN'; index: number }
  | { type: 'SET_FOCUS_STATE'; focusState: FocusState }
  | { type: 'SET_UNCOMMITTED_TOKEN'; token: Token | null }
  | { type: 'SET_ACTIVE_DROPDOWN'; dropdown: DropdownState }
  | { type: 'CLEAR' };

function queryBuilderReducer(
  state: QueryBuilderState,
  action: QueryBuilderAction
): QueryBuilderState {
  switch (action.type) {
    case 'SET_QUERY': {
      const parsedQuery = parseQuery(action.query);
      return {
        ...state,
        query: action.query,
        tokens: parsedQuery.tokens,
        parsedQuery,
      };
    }
    
    case 'SET_TOKENS': {
      const query = stringifyTokens(action.tokens);
      const parsedQuery = parseQuery(query);
      return {
        ...state,
        query,
        tokens: action.tokens,
        parsedQuery,
      };
    }
    
    case 'ADD_TOKEN': {
      const position = action.position ?? state.tokens.length;
      const newTokens = [...state.tokens];
      newTokens.splice(position, 0, action.token);
      const query = stringifyTokens(newTokens);
      const parsedQuery = parseQuery(query);
      return {
        ...state,
        query,
        tokens: newTokens,
        parsedQuery,
      };
    }
    
    case 'UPDATE_TOKEN': {
      const newTokens = [...state.tokens];
      newTokens[action.index] = action.token;
      const query = stringifyTokens(newTokens);
      const parsedQuery = parseQuery(query);
      return {
        ...state,
        query,
        tokens: newTokens,
        parsedQuery,
      };
    }
    
    case 'REMOVE_TOKEN': {
      const newTokens = state.tokens.filter((_, index) => index !== action.index);
      const query = stringifyTokens(newTokens);
      const parsedQuery = parseQuery(query);
      
      // Adjust focus state after token removal
      let newFocusState = state.focusState;
      if (state.focusState.type === 'token-part' && state.focusState.tokenIndex === action.index) {
        // Focus was on the removed token, move to previous input
        newFocusState = { type: 'input', inputIndex: action.index };
      } else if (state.focusState.type === 'token-part' && state.focusState.tokenIndex! > action.index) {
        // Adjust token index for tokens after the removed one
        newFocusState = {
          ...state.focusState,
          tokenIndex: state.focusState.tokenIndex! - 1
        };
      }
      
      return {
        ...state,
        query,
        tokens: newTokens,
        parsedQuery,
        focusState: newFocusState,
      };
    }
    
    case 'SET_FOCUS_STATE':
      return {
        ...state,
        focusState: action.focusState,
      };
    
    case 'SET_ACTIVE_DROPDOWN':
      return {
        ...state,
        activeDropdown: action.dropdown,
      };
    
    case 'SET_UNCOMMITTED_TOKEN':
      return {
        ...state,
        uncommittedToken: action.token,
      };
    
    case 'CLEAR':
      return {
        ...state,
        query: '',
        tokens: [],
        focusState: { type: 'input', inputIndex: 0 },
        uncommittedToken: null,
        parsedQuery: { tokens: [], freeText: [], filters: [] },
        activeDropdown: { type: null },
      };
    
    default:
      return state;
  }
}

export interface UseQueryBuilderProps {
  initialQuery: string;
  onChange?: (query: string) => void;
  onSearch?: (query: string) => void;
  apiClient?: ApiClient;
}

export function useQueryBuilder({
  initialQuery,
  onChange,
  onSearch,
  apiClient,
}: UseQueryBuilderProps) {
  const initialParsedQuery = useMemo(() => parseQuery(initialQuery), [initialQuery]);
  
  const initialState: QueryBuilderState = {
    query: initialQuery,
    tokens: initialParsedQuery.tokens,
    focusState: { type: 'input', inputIndex: initialParsedQuery.tokens.length },
    uncommittedToken: null,
    parsedQuery: initialParsedQuery,
    activeDropdown: { type: null },
  };

  const [state, dispatch] = useReducer(queryBuilderReducer, initialState);

  const setQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_QUERY', query });
    onChange?.(query);
  }, [onChange]);

  const addToken = useCallback((token: Token, position?: number) => {
    dispatch({ type: 'ADD_TOKEN', token, position });
    const insertPosition = position ?? state.tokens.length;
    const newTokens = [...state.tokens];
    newTokens.splice(insertPosition, 0, token);
    const newQuery = stringifyTokens(newTokens);
    onChange?.(newQuery);
  }, [state.tokens, onChange]);

  const updateToken = useCallback((index: number, token: Token) => {
    dispatch({ type: 'UPDATE_TOKEN', index, token });
    const newTokens = [...state.tokens];
    newTokens[index] = token;
    const newQuery = stringifyTokens(newTokens);
    onChange?.(newQuery);
  }, [state.tokens, onChange]);

  const removeToken = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_TOKEN', index });
    const newTokens = state.tokens.filter((_, i) => i !== index);
    const newQuery = stringifyTokens(newTokens);
    onChange?.(newQuery);
  }, [state.tokens, onChange]);

  const setFocusState = useCallback((focusState: FocusState) => {
    dispatch({ type: 'SET_FOCUS_STATE', focusState });
  }, []);

  const setActiveDropdown = useCallback((dropdown: DropdownState) => {
    dispatch({ type: 'SET_ACTIVE_DROPDOWN', dropdown });
  }, []);

  const moveFocus = useCallback((direction: 'left' | 'right') => {
    const currentFocus = state.focusState;
    const tokenCount = state.tokens.length;
    
    if (currentFocus.type === 'input') {
      // Moving from input position
      const currentInputIndex = currentFocus.inputIndex ?? 0;
      
      if (direction === 'right') {
        if (currentInputIndex < tokenCount) {
          // Enter the next token's first part
          setFocusState({
            type: 'token-part',
            tokenIndex: currentInputIndex,
            partIndex: 0
          });
        }
      } else {
        if (currentInputIndex > 0) {
          // Enter the previous token's last part
          setFocusState({
            type: 'token-part',
            tokenIndex: currentInputIndex - 1,
            partIndex: 3 // delete button is last
          });
        }
      }
    } else if (currentFocus.type === 'token-part') {
      // Moving within/between token parts
      const tokenIndex = currentFocus.tokenIndex!;
      const partIndex = currentFocus.partIndex!;
      
      if (direction === 'right') {
        if (partIndex < 3) {
          // Move to next part within same token
          setFocusState({
            type: 'token-part',
            tokenIndex,
            partIndex: partIndex + 1
          });
        } else {
          // Move to input after this token
          setFocusState({
            type: 'input',
            inputIndex: tokenIndex + 1
          });
        }
      } else {
        if (partIndex > 0) {
          // Move to previous part within same token
          setFocusState({
            type: 'token-part',
            tokenIndex,
            partIndex: partIndex - 1
          });
        } else {
          // Move to input before this token
          setFocusState({
            type: 'input',
            inputIndex: tokenIndex
          });
        }
      }
    }
    
    setActiveDropdown({ type: null }); // Close any open dropdowns
  }, [state.focusState, state.tokens.length, setFocusState, setActiveDropdown]);

  const setUncommittedToken = useCallback((token: Token | null) => {
    dispatch({ type: 'SET_UNCOMMITTED_TOKEN', token });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' });
    onChange?.('');
  }, [onChange]);

  const search = useCallback(() => {
    onSearch?.(state.query);
  }, [state.query, onSearch]);

  const addFilter = useCallback((filterKey: string, operator: string = '=', value: string = '') => {
    const filterToken: FilterToken = {
      key: `filter_${Date.now()}`,
      type: 'filter',
      filterKey,
      operator,
      value,
    };
    addToken(filterToken);
  }, [addToken]);

  return {
    state,
    setQuery,
    addToken,
    updateToken,
    removeToken,
    setFocusState,
    moveFocus,
    setUncommittedToken,
    setActiveDropdown,
    clear,
    search,
    addFilter,
    apiClient,
  };
}