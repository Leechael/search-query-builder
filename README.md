# Search Query Builder

> [!NOTE]
> This is an experiment project fully build by Claude Code.

A powerful and flexible search query interface inspired by Sentry's search functionality, built with React and TypeScript.

## 🚀 Live Demo

**[View Interactive Demo →](https://leechael.github.io/search-query-builder/)**

Try all features including keyboard navigation, autocomplete, and multiple instances!

## ✨ Features

- 🎯 **Smart Autocomplete** - Intelligent dropdown with Recent/All filter tabs
- ⌨️ **Full Keyboard Support** - Arrow keys, Tab navigation, Enter/Escape
- 🎨 **Perfect UX** - Focus states, click-outside-to-close, single dropdown management
- 🔧 **Highly Configurable** - Custom filter keys, operators, styling
- 💾 **Recent Searches** - localStorage persistence for recently used filters
- 🏗️ **Production Ready** - Thoroughly tested and optimized
- 📱 **Responsive** - Works perfectly on desktop and mobile
- 🔒 **TypeScript** - Full type safety and IntelliSense support

## 📦 Quick Start

### Installation

```bash
npm install @your-org/search-query-builder
# or
yarn add @your-org/search-query-builder
```

### Basic Usage

```typescript
import React, { useState } from 'react';
import { SearchQueryBuilder } from '@your-org/search-query-builder';

const filterKeys = [
  {
    key: 'browser.name',
    name: 'Browser Name',
    kind: 'field',
    valueType: 'string',
    allowedOperators: ['=', '!=']
  },
  {
    key: 'environment',
    name: 'Environment',
    kind: 'tag',
    valueType: 'string',
    allowedOperators: ['=', '!=']
  }
];

function App() {
  const [query, setQuery] = useState('');

  return (
    <SearchQueryBuilder
      query={query}
      onChange={setQuery}
      onSearch={(searchQuery) => {
        console.log('Search:', searchQuery);
        // Handle search logic here
      }}
      filterKeys={filterKeys}
      placeholder="Search issues, events, and more..."
    />
  );
}
```

## 🎮 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↓` / `↑` | Open dropdown / Navigate items |
| `←` / `→` | Switch between Recent/All tabs |
| `Enter` | Select highlighted item |
| `Escape` | Close dropdown |
| `Tab` / `Shift+Tab` | Navigate between inputs |
| `Backspace` | Delete previous token (when input is empty) |

## 📋 API Reference

### SearchQueryBuilder Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `query` | `string` | Yes | Current search query string |
| `onChange` | `(query: string) => void` | Yes | Called when query changes |
| `onSearch` | `(query: string) => void` | Yes | Called when search is submitted |
| `filterKeys` | `FilterKey[]` | No | Available filter keys for autocomplete |
| `filterKeySections` | `FilterKeySection[]` | No | Organized filter key sections |
| `placeholder` | `string` | No | Input placeholder text |
| `disabled` | `boolean` | No | Disable the input |
| `className` | `string` | No | Additional CSS classes |

### FilterKey Interface

```typescript
interface FilterKey {
  key: string;                    // Unique identifier (e.g., 'browser.name')
  name: string;                   // Display name (e.g., 'Browser Name')
  kind: string;                   // Category (e.g., 'field', 'tag')
  valueType: string;              // Data type (e.g., 'string', 'number')
  allowedOperators: string[];     // Valid operators (e.g., ['=', '!=', '~'])
  description?: string;           // Optional description
  deprecated?: boolean;           // Mark as deprecated
}
```

## 🔧 Advanced Usage

### Custom Filter Sections

```typescript
const filterKeySections = [
  {
    key: 'event',
    label: 'Event Attributes',
    children: [
      { key: 'event.type', name: 'Event Type', kind: 'field', valueType: 'string', allowedOperators: ['=', '!='] },
      { key: 'event.level', name: 'Level', kind: 'field', valueType: 'string', allowedOperators: ['=', '!='] }
    ]
  },
  {
    key: 'user',
    label: 'User Context',
    children: [
      { key: 'user.id', name: 'User ID', kind: 'field', valueType: 'string', allowedOperators: ['=', '!='] },
      { key: 'user.email', name: 'Email', kind: 'field', valueType: 'string', allowedOperators: ['=', '!='] }
    ]
  }
];

<SearchQueryBuilder
  query={query}
  onChange={setQuery}
  onSearch={handleSearch}
  filterKeys={allFilterKeys}
  filterKeySections={filterKeySections}
/>
```

### Handling Search Results

```typescript
const handleSearch = async (searchQuery: string) => {
  try {
    // Parse and execute search
    const results = await searchAPI({
      query: searchQuery,
      // ... other parameters
    });
    
    setSearchResults(results);
  } catch (error) {
    console.error('Search failed:', error);
  }
};
```

## 🏗️ Development

### Prerequisites

- Node.js 16+
- npm or yarn
- React 16.8+
- TypeScript 4.0+

### Local Development

```bash
# Clone the repository
git clone https://github.com/leechael/search-query-builder.git
cd search-query-builder

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Project Structure

```
src/
├── components/
│   ├── SearchQueryBuilder.tsx      # Main component
│   ├── FilterKeyDropdownEnhanced.tsx
│   ├── InterTokenInput.tsx
│   ├── TokenizedQueryGrid.tsx
│   └── ...
├── hooks/
│   └── useQueryBuilder.ts
├── utils/
│   └── dropdownManager.ts          # Global dropdown state
├── types/
│   └── index.ts                    # TypeScript definitions
└── tests/
    └── ...
```

## 🧪 Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Categories

- ✅ **Unit Tests** - Individual component behavior
- ✅ **Integration Tests** - Component interactions
- ✅ **Keyboard Navigation** - Full keyboard support
- ✅ **Focus Management** - Focus states and transitions
- ✅ **Multiple Instances** - Global dropdown management
