# ResizeGrid

A dynamic, resizable grid layout application built with React, TypeScript, and Vite that allows users to create, organize, and resize content panes in a flexible grid system.

## What It Does

ResizeGrid is a **dynamic layout management system** that provides:

- **Resizable Grid Layouts**: Create and resize panes both horizontally and vertically
- **Content Management**: Display and edit text content in organized panes
- **Dynamic Pane Creation**: Split existing panes to create new content areas
- **Persistent Layouts**: Save and restore your custom grid arrangements
- **Focus Management**: Track which pane is currently active

## How It Works

### Core Architecture

The application uses a **tree-based layout system** where each pane can be either:
- **Leaf Pane**: Contains content (text displays)
- **Split Pane**: Contains other panes arranged in rows or columns

### Key Components

#### 1. **SplitContainer** - The Layout Engine
- Renders the grid structure using CSS Grid
- Handles mouse drag events for resizing panes
- Manages the visual representation of the layout tree
- Creates resizer handles between panes

#### 2. **ContentSelector** - Content Management
- Provides a dropdown to select from predefined text content
- Allows opening content in new panes (row or column direction)
- Manages pane focus and layout structure updates

#### 3. **PaneRenderer** - Content Display
- Renders individual panes with their associated content
- Manages pane focus states
- Dynamically loads content components based on the component registry

#### 4. **TextDisplay** - Content Component
- Displays editable text content
- Allows inline editing of text
- Provides close functionality for individual content items

### State Management

The application uses **Zustand** for state management with these key stores:

- **Layout Store**: Manages the entire layout structure, pane relationships, and content displays
- **Persistent Storage**: Automatically saves layouts to localStorage
- **Real-time Updates**: Updates the UI immediately when layouts change

### Layout System

#### Pane Structure
```typescript
type Pane = {
  id: string;
  type: 'split' | 'leaf' | 'content';
  direction: 'row' | 'column';
  sizes: number[];        // Relative sizes of child panes
  children?: Pane[];      // Child panes (for split panes)
  displayContent?: string[]; // Content IDs to display
}
```

#### Resizing Algorithm
1. **Mouse Down**: Captures initial position and pane sizes
2. **Mouse Move**: Calculates new sizes based on drag distance
3. **Size Normalization**: Ensures sizes remain proportional and within bounds
4. **Layout Update**: Propagates changes through the layout tree

### Content System

The application comes with **pre-built text content** (Lorem Ipsum style) that can be:
- Selected from a dropdown menu
- Opened in new panes
- Edited inline
- Closed individually

## Features

### 🎯 **Dynamic Layouts**
- Create panes by splitting existing ones
- Resize panes by dragging the borders
- Support for both horizontal and vertical splits

### 📱 **Responsive Design**
- CSS Grid-based layout system
- Automatic size normalization
- Minimum size constraints to prevent unusable panes

### 💾 **Persistence**
- Layouts automatically save to localStorage
- Restore your custom arrangements on page reload
- Separate storage for layout structure and content displays

### 🔧 **Developer Experience**
- TypeScript for type safety
- Zustand for predictable state management
- Redux DevTools integration for debugging

## Technical Implementation

### Dependencies
- **React 19**: Latest React with modern features
- **TypeScript**: Full type safety throughout the codebase
- **Zustand**: Lightweight state management
- **Vite**: Fast development and build tooling

### Key Algorithms

#### Size Normalization
```typescript
function normalizeSizes(sizes: number[], count: number) {
  const filled = Array.from({ length: count }, (_, i) => sizes[i] ?? DEFAULT_SIZE);
  const total = filled.reduce((a, b) => a + b, 0);
  return filled.map((s) => s / total);
}
```

#### Layout Structure Updates
The system maintains both a flat structure for easy updates and a hierarchical structure for rendering, automatically syncing between the two.

## Usage

1. **Select Content**: Choose from the dropdown of available text content
2. **Create Panes**: Click "Open row" or "Open column" to create new panes
3. **Resize Panes**: Drag the borders between panes to resize them
4. **Edit Content**: Click on text to edit it inline
5. **Close Content**: Use the close button on individual content items
6. **Focus Management**: Click on panes to focus them for new content placement

## Development

### Prerequisites
- Node.js 23+ (required for Vite 7)
- npm or yarn

### Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
npm run preview
```

## Architecture Benefits

- **Modular**: Each component has a single responsibility
- **Extensible**: Easy to add new content types via the component registry
- **Performant**: Efficient updates using flat data structures
- **Maintainable**: Clear separation of concerns between layout, content, and state

This application demonstrates advanced React patterns for building complex, interactive layout systems with real-time updates and persistent state management.
