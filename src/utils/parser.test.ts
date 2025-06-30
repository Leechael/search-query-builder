import { parseQuery, stringifyTokens, validateToken, OPERATORS } from './parser';
import { FilterToken, FreeTextToken, BooleanToken, ParenToken } from '@/types';

describe('parseQuery', () => {
  it('should parse simple free text', () => {
    const result = parseQuery('hello world');
    expect(result.tokens).toHaveLength(2);
    expect(result.tokens[0].type).toBe('freeText');
    expect(result.tokens[0].value).toBe('hello');
    expect(result.tokens[1].type).toBe('freeText');
    expect(result.tokens[1].value).toBe('world');
    expect(result.freeText).toEqual(['hello', 'world']);
  });

  it('should parse simple filter tokens', () => {
    const result = parseQuery('browser.name:Chrome');
    expect(result.tokens).toHaveLength(1);
    expect(result.tokens[0].type).toBe('filter');
    const filterToken = result.tokens[0] as FilterToken;
    expect(filterToken.filterKey).toBe('browser.name');
    expect(filterToken.value).toBe('Chrome');
    expect(filterToken.operator).toBe(OPERATORS.EQUAL);
    expect(filterToken.negated).toBe(false);
  });

  it('should parse filter tokens with operators', () => {
    const result = parseQuery('count:>100');
    expect(result.tokens).toHaveLength(1);
    const filterToken = result.tokens[0] as FilterToken;
    expect(filterToken.filterKey).toBe('count');
    expect(filterToken.value).toBe('100');
    expect(filterToken.operator).toBe(OPERATORS.GREATER_THAN);
  });

  it('should parse negated filters', () => {
    const result = parseQuery('status:!resolved');
    expect(result.tokens).toHaveLength(1);
    const filterToken = result.tokens[0] as FilterToken;
    expect(filterToken.filterKey).toBe('status');
    expect(filterToken.value).toBe('resolved');
    expect(filterToken.negated).toBe(true);
  });

  it('should parse quoted values', () => {
    const result = parseQuery('message:"hello world"');
    expect(result.tokens).toHaveLength(1);
    const filterToken = result.tokens[0] as FilterToken;
    expect(filterToken.filterKey).toBe('message');
    expect(filterToken.value).toBe('hello world');
  });

  it('should parse array values', () => {
    const result = parseQuery('status:[resolved,ignored]');
    expect(result.tokens).toHaveLength(1);
    const filterToken = result.tokens[0] as FilterToken;
    expect(filterToken.filterKey).toBe('status');
    expect(Array.isArray(filterToken.value)).toBe(true);
    expect(filterToken.value).toEqual(['resolved', 'ignored']);
  });

  it('should parse boolean operators', () => {
    const result = parseQuery('browser.name:Chrome AND status:unresolved');
    expect(result.tokens).toHaveLength(3);
    expect(result.tokens[0].type).toBe('filter');
    expect(result.tokens[1].type).toBe('boolean');
    expect(result.tokens[1].value).toBe('AND');
    expect(result.tokens[2].type).toBe('filter');
  });

  it('should parse parentheses', () => {
    const result = parseQuery('( browser.name:Chrome OR browser.name:Firefox )');
    expect(result.tokens).toHaveLength(5);
    expect(result.tokens[0].type).toBe('paren');
    expect(result.tokens[0].value).toBe('(');
    expect(result.tokens[4].type).toBe('paren');
    expect(result.tokens[4].value).toBe(')');
  });

  it('should parse complex queries', () => {
    const result = parseQuery('browser.name:Chrome user.email:test@example.com AND status:unresolved error message');
    expect(result.tokens).toHaveLength(6);
    expect(result.filters).toHaveLength(3);
    expect(result.freeText).toEqual(['error', 'message']);
  });
});

describe('stringifyTokens', () => {
  it('should stringify filter tokens', () => {
    const filterToken: FilterToken = {
      key: 'filter_1',
      type: 'filter',
      filterKey: 'browser.name',
      operator: OPERATORS.EQUAL,
      value: 'Chrome',
    };
    const result = stringifyTokens([filterToken]);
    expect(result).toBe('browser.name:Chrome');
  });

  it('should stringify filter tokens with operators', () => {
    const filterToken: FilterToken = {
      key: 'filter_1',
      type: 'filter',
      filterKey: 'count',
      operator: OPERATORS.GREATER_THAN,
      value: '100',
    };
    const result = stringifyTokens([filterToken]);
    expect(result).toBe('count:>100');
  });

  it('should stringify negated filters', () => {
    const filterToken: FilterToken = {
      key: 'filter_1',
      type: 'filter',
      filterKey: 'status',
      operator: OPERATORS.EQUAL,
      value: 'resolved',
      negated: true,
    };
    const result = stringifyTokens([filterToken]);
    expect(result).toBe('status:!resolved');
  });

  it('should stringify array values', () => {
    const filterToken: FilterToken = {
      key: 'filter_1',
      type: 'filter',
      filterKey: 'status',
      operator: OPERATORS.EQUAL,
      value: ['resolved', 'ignored'],
    };
    const result = stringifyTokens([filterToken]);
    expect(result).toBe('status:[resolved,ignored]');
  });

  it('should quote values with spaces', () => {
    const filterToken: FilterToken = {
      key: 'filter_1',
      type: 'filter',
      filterKey: 'message',
      operator: OPERATORS.EQUAL,
      value: 'hello world',
    };
    const result = stringifyTokens([filterToken]);
    expect(result).toBe('message:"hello world"');
  });

  it('should stringify free text tokens', () => {
    const freeTextToken: FreeTextToken = {
      key: 'freetext_1',
      type: 'freeText',
      value: 'error',
    };
    const result = stringifyTokens([freeTextToken]);
    expect(result).toBe('error');
  });

  it('should stringify boolean tokens', () => {
    const booleanToken: BooleanToken = {
      key: 'boolean_1',
      type: 'boolean',
      value: 'AND',
    };
    const result = stringifyTokens([booleanToken]);
    expect(result).toBe('AND');
  });

  it('should stringify paren tokens', () => {
    const parenToken: ParenToken = {
      key: 'paren_1',
      type: 'paren',
      value: '(',
    };
    const result = stringifyTokens([parenToken]);
    expect(result).toBe('(');
  });
});

describe('validateToken', () => {
  it('should validate filter tokens', () => {
    const validToken: FilterToken = {
      key: 'filter_1',
      type: 'filter',
      filterKey: 'browser.name',
      operator: OPERATORS.EQUAL,
      value: 'Chrome',
    };
    expect(validateToken(validToken)).toBeNull();

    const invalidTokenNoKey: FilterToken = {
      key: 'filter_1',
      type: 'filter',
      filterKey: '',
      operator: OPERATORS.EQUAL,
      value: 'Chrome',
    };
    expect(validateToken(invalidTokenNoKey)).toBe('Filter key is required');

    const invalidTokenNoValue: FilterToken = {
      key: 'filter_1',
      type: 'filter',
      filterKey: 'browser.name',
      operator: OPERATORS.EQUAL,
      value: '',
    };
    expect(validateToken(invalidTokenNoValue)).toBe('Filter value is required');
  });

  it('should validate free text tokens', () => {
    const validToken: FreeTextToken = {
      key: 'freetext_1',
      type: 'freeText',
      value: 'error',
    };
    expect(validateToken(validToken)).toBeNull();

    const invalidToken: FreeTextToken = {
      key: 'freetext_1',
      type: 'freeText',
      value: '',
    };
    expect(validateToken(invalidToken)).toBe('Free text cannot be empty');
  });
});