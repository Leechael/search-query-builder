import React, { useState } from 'react';
import { SearchQueryBuilder } from './components/SearchQueryBuilder';
import { createApiClient } from './api/client';
import { FilterKey, FilterKeySection } from './types';

const mockFilterKeys: FilterKey[] = [
  {
    key: 'browser.name',
    name: 'Browser Name',
    kind: 'field',
    valueType: 'string',
    allowedOperators: ['=', '!=', 'contains', 'starts_with'],
    description: 'The name of the browser used',
  },
  {
    key: 'user.email',
    name: 'User Email',
    kind: 'field',
    valueType: 'string',
    allowedOperators: ['=', '!=', 'contains'],
    description: 'The email address of the user',
  },
  {
    key: 'environment',
    name: 'Environment',
    kind: 'tag',
    valueType: 'string',
    allowedOperators: ['=', '!='],
    description: 'The deployment environment',
  },
  {
    key: 'release',
    name: 'Release',
    kind: 'tag',
    valueType: 'string',
    allowedOperators: ['=', '!=', 'contains'],
    description: 'The release version',
  },
  {
    key: 'transaction',
    name: 'Transaction',
    kind: 'field',
    valueType: 'string',
    allowedOperators: ['=', '!=', 'contains', 'starts_with'],
    description: 'The transaction name or endpoint',
  },
  {
    key: 'level',
    name: 'Level',
    kind: 'field',
    valueType: 'string',
    allowedOperators: ['=', '!='],
    description: 'The severity level',
  },
  {
    key: 'status',
    name: 'Status',
    kind: 'field',
    valueType: 'string',
    allowedOperators: ['=', '!='],
    description: 'The issue status',
  },
  {
    key: 'count',
    name: 'Count',
    kind: 'measurement',
    valueType: 'number',
    allowedOperators: ['>', '<', '>=', '<=', '=', '!='],
    description: 'The event count',
  },
  {
    key: 'timestamp',
    name: 'Timestamp',
    kind: 'field',
    valueType: 'date',
    allowedOperators: ['>', '<', '>=', '<=', '='],
    description: 'When the event occurred',
  },
  {
    key: 'assigned',
    name: 'Assignee',
    kind: 'field',
    valueType: 'string',
    allowedOperators: ['=', '!='],
    description: 'The user or team assigned to this issue',
  },
];

const mockFilterKeySections: FilterKeySection[] = [
  {
    key: 'fields',
    label: 'Fields',
    children: mockFilterKeys.filter(key => key.kind === 'field'),
  },
  {
    key: 'tags',
    label: 'Tags',
    children: mockFilterKeys.filter(key => key.kind === 'tag'),
  },
  {
    key: 'measurements',
    label: 'Measurements',
    children: mockFilterKeys.filter(key => key.kind === 'measurement'),
  },
];

export function App() {
  const [query, setQuery] = useState('browser.name:Chrome status:unresolved');
  const [searchResults, setSearchResults] = useState<string>('');
  
  const apiClient = createApiClient({ mock: true });

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    console.log('Query changed:', newQuery);
  };

  const handleSearch = (searchQuery: string) => {
    setSearchResults(`Searching for: "${searchQuery}"`);
    console.log('Search executed:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Search Query Builder Demo
          </h1>
          
          <div className="space-y-6">
            {/* Main Search Query Builder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visual Query Builder
              </label>
              <SearchQueryBuilder
                query={query}
                onChange={handleQueryChange}
                onSearch={handleSearch}
                filterKeys={mockFilterKeys}
                filterKeySections={mockFilterKeySections}
                apiClient={apiClient}
                placeholder="Search issues, events, or use filters like browser.name:Chrome"
              />
            </div>

            {/* Plain Text Fallback */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plain Text Mode (Fallback)
              </label>
              <SearchQueryBuilder
                query={query}
                onChange={handleQueryChange}
                onSearch={handleSearch}
                filterKeys={mockFilterKeys}
                apiClient={apiClient}
                placeholder="Plain text search..."
                disallowFreeText={false}
              />
            </div>

            {/* Restricted Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filters Only Mode
              </label>
              <SearchQueryBuilder
                query={query}
                onChange={handleQueryChange}
                onSearch={handleSearch}
                filterKeys={mockFilterKeys}
                filterKeySections={mockFilterKeySections}
                apiClient={apiClient}
                placeholder="Use filters only..."
                disallowFreeText={true}
              />
            </div>

            {/* Current Query Display */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Query:</h3>
              <code className="text-sm text-gray-900 bg-white px-2 py-1 rounded border">
                {query || '(empty)'}
              </code>
            </div>

            {/* Search Results */}
            {searchResults && (
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Search Results:</h3>
                <p className="text-sm text-blue-700">{searchResults}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Try these features:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Type "browser:" to see filter suggestions</li>
                <li>• Click on existing filter tokens to edit them</li>
                <li>• Use the operator dropdown to change filter operators</li>
                <li>• Click on values to see value suggestions from the mock API</li>
                <li>• Try multi-select mode for filter values</li>
                <li>• Press Enter to search, or use the search button</li>
                <li>• Use the clear button (×) to remove tokens or clear the entire query</li>
              </ul>
            </div>

            {/* Available Filter Keys */}
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <h3 className="text-sm font-medium text-green-800 mb-2">Available Filter Keys:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-green-700">
                {mockFilterKeys.map(key => (
                  <div key={key.key} className="flex flex-col">
                    <code className="font-mono text-xs bg-white px-1 rounded">{key.key}</code>
                    <span className="text-xs text-green-600">{key.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}