import { Token, FilterToken, FreeTextToken, BooleanToken, ParenToken } from '@/types';

export interface ParsedQuery {
  tokens: Token[];
  freeText: string[];
  filters: FilterToken[];
}

export interface TokenLocation {
  start: { offset: number; line: number; column: number };
  end: { offset: number; line: number; column: number };
}

function parseQueryParts(query: string): string[] {
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < query.length; i++) {
    const char = query[i];
    
    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = true;
      quoteChar = char;
      current += char;
    } else if (inQuotes && char === quoteChar) {
      inQuotes = false;
      current += char;
      quoteChar = '';
    } else if (!inQuotes && /\s/.test(char)) {
      if (current.trim()) {
        parts.push(current.trim());
        current = '';
      }
    } else {
      current += char;
    }
  }
  
  if (current.trim()) {
    parts.push(current.trim());
  }
  
  return parts;
}

export const OPERATORS = {
  EQUAL: '=',
  NOT_EQUAL: '!=',
  GREATER_THAN: '>',
  LESS_THAN: '<',
  GREATER_THAN_EQUAL: '>=',
  LESS_THAN_EQUAL: '<=',
  CONTAINS: 'contains',
  DOES_NOT_CONTAIN: 'does_not_contain',
  STARTS_WITH: 'starts_with',
  ENDS_WITH: 'ends_with',
} as const;

export type OperatorType = typeof OPERATORS[keyof typeof OPERATORS];

export function generateTokenKey(token: Token, index: number): string {
  return `${token.type}:${index}:${token.key || token.value}`;
}

export function parseQuery(query: string): ParsedQuery {
  const tokens: Token[] = [];
  const freeText: string[] = [];
  const filters: FilterToken[] = [];
  
  // More sophisticated tokenization that handles quoted strings
  const parts = parseQueryParts(query);
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    if (part === 'AND' || part === 'OR') {
      const booleanToken: BooleanToken = {
        key: `boolean_${i}`,
        value: part as 'AND' | 'OR',
        type: 'boolean',
      };
      tokens.push(booleanToken);
    } else if (part === '(' || part === ')') {
      const parenToken: ParenToken = {
        key: `paren_${i}`,
        value: part as '(' | ')',
        type: 'paren',
      };
      tokens.push(parenToken);
    } else if (part.includes(':')) {
      // Filter token
      const [key, ...valueParts] = part.split(':');
      const value = valueParts.join(':');
      
      // Detect operator
      let operator = OPERATORS.EQUAL;
      let actualValue = value;
      let negated = false;
      
      if (value.startsWith('!')) {
        negated = true;
        actualValue = value.slice(1);
      } else if (value.startsWith('>=')) {
        operator = OPERATORS.GREATER_THAN_EQUAL;
        actualValue = value.slice(2);
      } else if (value.startsWith('<=')) {
        operator = OPERATORS.LESS_THAN_EQUAL;
        actualValue = value.slice(2);
      } else if (value.startsWith('>')) {
        operator = OPERATORS.GREATER_THAN;
        actualValue = value.slice(1);
      } else if (value.startsWith('<')) {
        operator = OPERATORS.LESS_THAN;
        actualValue = value.slice(1);
      }
      
      // Handle quoted values
      if (actualValue.startsWith('"') && actualValue.endsWith('"')) {
        actualValue = actualValue.slice(1, -1);
      }
      
      // Handle array values
      if (actualValue.startsWith('[') && actualValue.endsWith(']')) {
        actualValue = actualValue.slice(1, -1).split(',').map(v => v.trim());
      }
      
      const filterToken: FilterToken = {
        key: `filter_${i}`,
        filterKey: key || '',
        value: actualValue,
        type: 'filter',
        operator,
        negated,
      };
      
      tokens.push(filterToken);
      filters.push(filterToken);
    } else {
      // Free text token
      const freeTextToken: FreeTextToken = {
        key: `freetext_${i}`,
        value: part,
        type: 'freeText',
      };
      tokens.push(freeTextToken);
      freeText.push(part);
    }
  }
  
  return {
    tokens,
    freeText,
    filters,
  };
}

export function stringifyTokens(tokens: Token[]): string {
  return tokens.map(token => {
    switch (token.type) {
      case 'filter':
        const filterToken = token as FilterToken;
        let valueStr = Array.isArray(filterToken.value) 
          ? `[${filterToken.value.join(',')}]`
          : filterToken.value;
        
        if (typeof valueStr === 'string' && valueStr.includes(' ')) {
          valueStr = `"${valueStr}"`;
        }
        
        let prefix = '';
        if (filterToken.operator !== OPERATORS.EQUAL) {
          prefix = filterToken.operator;
        }
        if (filterToken.negated) {
          prefix = '!' + prefix;
        }
        
        return `${filterToken.filterKey}:${prefix}${valueStr}`;
      
      case 'freeText':
        return token.value;
      
      case 'boolean':
        return token.value;
      
      case 'paren':
        return token.value;
      
      default:
        return String(token.value);
    }
  }).join(' ');
}

export function validateToken(token: Token): string | null {
  switch (token.type) {
    case 'filter':
      const filterToken = token as FilterToken;
      if (!filterToken.filterKey) {
        return 'Filter key is required';
      }
      if (!filterToken.value) {
        return 'Filter value is required';
      }
      break;
    case 'freeText':
      if (!token.value || String(token.value).trim().length === 0) {
        return 'Free text cannot be empty';
      }
      break;
  }
  return null;
}