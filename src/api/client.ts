import { ApiClient, FilterKey, ValueSuggestion } from '@/types';

export class DefaultApiClient implements ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async getTagValues(key: string, query?: string): Promise<string[]> {
    const url = new URL(`${this.baseUrl}/tags/${key}/values`);
    if (query) {
      url.searchParams.set('query', query);
    }

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.values || [];
    } catch (error) {
      console.error('Failed to fetch tag values:', error);
      return [];
    }
  }

  async getFilterKeySuggestions(): Promise<FilterKey[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search/filter-keys`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.filterKeys || [];
    } catch (error) {
      console.error('Failed to fetch filter keys:', error);
      return [];
    }
  }
}

// Mock client for testing and development
export class MockApiClient implements ApiClient {
  private mockTagValues: Record<string, string[]> = {
    'browser.name': ['Chrome', 'Firefox', 'Safari', 'Edge'],
    'user.email': ['user1@example.com', 'user2@example.com', 'admin@example.com'],
    'environment': ['production', 'staging', 'development'],
    'release': ['1.0.0', '1.1.0', '1.2.0', '2.0.0'],
    'transaction': ['/api/users', '/api/events', '/dashboard', '/settings'],
    'level': ['error', 'warning', 'info', 'debug'],
    'status': ['resolved', 'unresolved', 'ignored'],
    'assigned': ['user1', 'user2', 'team1'],
  };

  private mockFilterKeys: FilterKey[] = [
    {
      key: 'browser.name',
      name: 'Browser Name',
      kind: 'field',
      valueType: 'string',
      allowedOperators: ['=', '!=', 'contains', 'starts_with'],
    },
    {
      key: 'user.email',
      name: 'User Email',
      kind: 'field',
      valueType: 'string',
      allowedOperators: ['=', '!=', 'contains'],
    },
    {
      key: 'environment',
      name: 'Environment',
      kind: 'tag',
      valueType: 'string',
      allowedOperators: ['=', '!='],
    },
    {
      key: 'release',
      name: 'Release',
      kind: 'tag',
      valueType: 'string',
      allowedOperators: ['=', '!=', 'contains'],
    },
    {
      key: 'transaction',
      name: 'Transaction',
      kind: 'field',
      valueType: 'string',
      allowedOperators: ['=', '!=', 'contains', 'starts_with'],
    },
    {
      key: 'level',
      name: 'Level',
      kind: 'field',
      valueType: 'string',
      allowedOperators: ['=', '!='],
    },
    {
      key: 'status',
      name: 'Status',
      kind: 'field',
      valueType: 'string',
      allowedOperators: ['=', '!='],
    },
    {
      key: 'count',
      name: 'Count',
      kind: 'measurement',
      valueType: 'number',
      allowedOperators: ['>', '<', '>=', '<=', '=', '!='],
    },
    {
      key: 'timestamp',
      name: 'Timestamp',
      kind: 'field',
      valueType: 'date',
      allowedOperators: ['>', '<', '>=', '<=', '='],
    },
    {
      key: 'assigned',
      name: 'Assignee',
      kind: 'field',
      valueType: 'string',
      allowedOperators: ['=', '!='],
    },
  ];

  async getTagValues(key: string, query?: string): Promise<string[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const values = this.mockTagValues[key] || [];
    
    if (query) {
      return values.filter(value => 
        value.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    return values;
  }

  async getFilterKeySuggestions(): Promise<FilterKey[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 50));
    return this.mockFilterKeys;
  }
}

// Factory function for creating API clients
export function createApiClient(options?: {
  baseUrl?: string;
  mock?: boolean;
}): ApiClient {
  if (options?.mock) {
    return new MockApiClient();
  }
  return new DefaultApiClient(options?.baseUrl);
}