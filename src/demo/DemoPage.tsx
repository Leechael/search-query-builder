import React, { useState } from 'react';
import { SearchQueryBuilder } from '../components/SearchQueryBuilder';
import { FilterKey } from '../types';

const mockFilterKeys: FilterKey[] = [
  {
    key: 'browser.name',
    name: 'Browser Name',
    kind: 'field',
    valueType: 'string',
    allowedOperators: ['=', '!='],
    description: 'Name of the browser'
  },
  {
    key: 'environment',
    name: 'Environment',
    kind: 'tag',
    valueType: 'string',
    allowedOperators: ['=', '!='],
    description: 'Deployment environment'
  },
  {
    key: 'user.id',
    name: 'User ID',
    kind: 'field',
    valueType: 'string',
    allowedOperators: ['=', '!='],
    description: 'Unique user identifier'
  },
  {
    key: 'event.type',
    name: 'Event Type',
    kind: 'field',
    valueType: 'string',
    allowedOperators: ['=', '!='],
    description: 'Type of event'
  },
  {
    key: 'release',
    name: 'Release',
    kind: 'tag',
    valueType: 'string',
    allowedOperators: ['=', '!='],
    description: 'Release version'
  },
  {
    key: 'transaction.duration',
    name: 'Duration',
    kind: 'measurement',
    valueType: 'number',
    allowedOperators: ['=', '!=', '>', '<'],
    description: 'Transaction duration in milliseconds'
  }
];

const filterKeySections = [
  {
    key: 'event',
    label: 'Event Attributes',
    children: [
      mockFilterKeys.find(k => k.key === 'event.type')!,
    ]
  },
  {
    key: 'user',
    label: 'User Context',
    children: [
      mockFilterKeys.find(k => k.key === 'user.id')!,
    ]
  },
  {
    key: 'browser',
    label: 'Browser',
    children: [
      mockFilterKeys.find(k => k.key === 'browser.name')!,
    ]
  }
];

function SingleDemo() {
  const [query, setQuery] = useState('');

  return (
    <div className="space-y-4">
      <SearchQueryBuilder
        query={query}
        onChange={setQuery}
        onSearch={(q) => console.log('Search:', q)}
        filterKeys={mockFilterKeys}
        filterKeySections={filterKeySections}
        placeholder="Search events, issues, and more..."
      />
      <div className="p-4 bg-white rounded border">
        <strong>Current Query:</strong> 
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded ml-2">
          "{query}"
        </span>
      </div>
    </div>
  );
}

function MultipleDemo() {
  const [query1, setQuery1] = useState('');
  const [query2, setQuery2] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Query Builder #1
        </label>
        <SearchQueryBuilder
          query={query1}
          onChange={setQuery1}
          onSearch={(q) => console.log('Search 1:', q)}
          filterKeys={mockFilterKeys}
          placeholder="First search instance..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Query Builder #2
        </label>
        <SearchQueryBuilder
          query={query2}
          onChange={setQuery2}
          onSearch={(q) => console.log('Search 2:', q)}
          filterKeys={mockFilterKeys}
          placeholder="Second search instance..."
        />
      </div>
      
      <div className="p-4 bg-white rounded border">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> Try opening dropdowns in both instances - only one will be visible at a time.
        </p>
        <div className="mt-2 space-y-1">
          <div><strong>Query 1:</strong> <span className="font-mono text-sm">"{query1}"</span></div>
          <div><strong>Query 2:</strong> <span className="font-mono text-sm">"{query2}"</span></div>
        </div>
      </div>
    </div>
  );
}

export function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Search Query Builder
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            A powerful and flexible search query interface inspired by Sentry's search functionality
          </p>
          <div className="flex justify-center space-x-4">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Production Ready
            </span>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              TypeScript
            </span>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              React 19+
            </span>
          </div>
        </header>

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Smart Autocomplete</h3>
              <p className="text-gray-600">
                Intelligent dropdown with tabs for Recent and All filter keys, supporting keyboard navigation
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">⌨️ Full Keyboard Support</h3>
              <p className="text-gray-600">
                Arrow keys for navigation, Tab/Shift+Tab for focus management, Enter to select, Escape to close
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🎨 Perfect UX</h3>
              <p className="text-gray-600">
                Focus states, click-outside-to-close, single dropdown management across multiple instances
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🔧 Highly Configurable</h3>
              <p className="text-gray-600">
                Customizable filter keys, operators, value types, and styling. Full TypeScript support
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">💾 Recent Searches</h3>
              <p className="text-gray-600">
                Automatically remembers recently used filter keys with localStorage persistence
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🏗️ Production Ready</h3>
              <p className="text-gray-600">
                Thoroughly tested, optimized performance, and battle-tested in real applications
              </p>
            </div>
          </div>
        </section>

        {/* Live Demo */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Interactive Demo</h2>
            <p className="text-gray-600 mb-6">
              Try the search query builder below. Click in the input, use arrow keys to open the dropdown, and explore the features!
            </p>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Single Instance</h3>
                <SingleDemo />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Multiple Instances (Test Single Dropdown Management)
                </h3>
                <MultipleDemo />
              </div>
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Keyboard Shortcuts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Navigation</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-gray-100 border rounded text-sm">↓</kbd>
                    <span className="text-gray-600">Open dropdown / Navigate down</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-gray-100 border rounded text-sm">↑</kbd>
                    <span className="text-gray-600">Navigate up in dropdown</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-gray-100 border rounded text-sm">←→</kbd>
                    <span className="text-gray-600">Switch between tabs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-gray-100 border rounded text-sm">Enter</kbd>
                    <span className="text-gray-600">Select item</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-gray-100 border rounded text-sm">Escape</kbd>
                    <span className="text-gray-600">Close dropdown</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Input</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-gray-100 border rounded text-sm">Tab</kbd>
                    <span className="text-gray-600">Move to next input</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-gray-100 border rounded text-sm">Shift+Tab</kbd>
                    <span className="text-gray-600">Move to previous input</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-gray-100 border rounded text-sm">Backspace</kbd>
                    <span className="text-gray-600">Delete previous token</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-gray-100 border rounded text-sm">:</kbd>
                    <span className="text-gray-600">Auto-complete filter syntax</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Updates */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Updates & Fixes</h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
              <h4 className="font-semibold text-green-800">✅ Focus State Management</h4>
              <p className="text-gray-600 mt-1">
                Fixed focus states to remain visible when interacting with dropdown components
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
              <h4 className="font-semibold text-green-800">✅ Click Outside to Close</h4>
              <p className="text-gray-600 mt-1">
                Added proper outside click detection to close dropdowns automatically
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
              <h4 className="font-semibold text-green-800">✅ Single Dropdown Management</h4>
              <p className="text-gray-600 mt-1">
                Implemented global dropdown manager to ensure only one dropdown is open at a time
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
              <h4 className="font-semibold text-green-800">✅ Tab Switching Fixed</h4>
              <p className="text-gray-600 mt-1">
                Resolved issues with tab switching in dropdown by fixing event handling conflicts
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
              <h4 className="font-semibold text-green-800">✅ Keyboard Navigation</h4>
              <p className="text-gray-600 mt-1">
                Fixed highlighting to correctly show first item when opening dropdown with arrow keys
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-600">
            Built with ❤️ by the development team. 
            <a 
              href="https://github.com/your-repo/search-query-builder" 
              className="text-blue-600 hover:text-blue-800 ml-1"
            >
              View on GitHub
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}