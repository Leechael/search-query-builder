export interface Token {
  key: string;
  value: any;
  type: TokenType;
  operator?: string;
  negated?: boolean;
  invalid?: string | null;
}

export type TokenType = 
  | 'filter'
  | 'freeText'
  | 'boolean'
  | 'paren';

export interface FilterToken extends Token {
  type: 'filter';
  filterKey: string;
  operator: string;
  value: string | string[];
}

export interface FreeTextToken extends Token {
  type: 'freeText';
  value: string;
}

export interface BooleanToken extends Token {
  type: 'boolean';
  value: 'AND' | 'OR';
}

export interface ParenToken extends Token {
  type: 'paren';
  value: '(' | ')';
}

export interface FilterKeySection {
  key: string;
  label: string;
  children: FilterKey[];
}

export interface FilterKey {
  key: string;
  name: string;
  kind: FieldKind;
  predefined?: boolean;
  deprecated?: boolean;
  description?: string;
  valueType?: ValueType;
  allowedOperators?: string[];
}

export type FieldKind = 
  | 'field'
  | 'tag'
  | 'measurement'
  | 'function'
  | 'breakdowns';

export type ValueType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'duration'
  | 'size'
  | 'percentage';

export interface DropdownState {
  type: 'filter-key' | 'value' | 'operator' | null;
  tokenIndex?: number;
}

export interface FocusState {
  type: 'input' | 'token-part';
  inputIndex?: number; // For input positions (0 = before first token, 1 = between first and second, etc.)
  tokenIndex?: number; // For token parts
  partIndex?: number; // For which part of the token (0=key, 1=operator, 2=value, 3=delete)
}

export interface QueryBuilderState {
  query: string;
  tokens: Token[];
  focusState: FocusState;
  uncommittedToken: Token | null;
  parsedQuery: ParsedQuery;
  activeDropdown: DropdownState;
}

export interface ParsedQuery {
  tokens: Token[];
  freeText: string[];
  filters: FilterToken[];
}

export interface SearchConfig {
  filterKeys: FilterKey[];
  filterKeySections?: FilterKeySection[];
  disallowFreeText?: boolean;
  disallowWildcard?: boolean;
  disallowLogicalOperators?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export interface ApiClient {
  getTagValues(key: string, query?: string): Promise<string[]>;
  getFilterKeySuggestions(): Promise<FilterKey[]>;
}

export interface ValueSuggestion {
  value: string;
  label?: string;
  description?: string;
  kind?: string;
}

export interface SearchQueryBuilderProps extends SearchConfig {
  query: string;
  onChange: (query: string) => void;
  onSearch?: (query: string) => void;
  apiClient?: ApiClient;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}