# Construction Tasks Web-App

An offline-first web application for managing construction tasks on a floor plan. Built with React, RxDB, TypeScript, and Zustand.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation & Running

```bash
# Install dependencies
pnpm install

# Development server (with hot reload)
pnpm dev

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Build for production
pnpm build

# Preview production build
pnpm preview
```

The application will be available at `https://localhost:3000` (development) or `https://localhost:8080` (preview).

## 📋 Features Implemented

✅ **Login-light System**

- Simple name-based authentication (no password required)
- Multi-user support with data isolation
- User persistence in RxDB

✅ **Floor Plan View**

- Interactive construction plan with task markers
- Click/tap to add new tasks
- Visual task progress indicators
- Zoom functionality with keyboard shortcuts

✅ **Task Management**

- Create, edit, and delete tasks
- Position tasks on the floor plan
- Task list/board view
- Real-time updates across components

✅ **Checklist System**

- Default checklist for new tasks
- Add, edit, delete checklist items
- 5-status workflow:
  - Not Started
  - In Progress
  - Blocked
  - Final Check
  - Done

✅ **Offline-First Architecture**

- All data persisted in IndexedDB via RxDB
- Works completely offline
- No external API dependencies

## ⏱️ Development Timeline

Based on git history (roughly 18 hours of work):

### June 16 - Initial Setup

- One commit setting up the project basics
- Maybe an hour or so

### June 17 - Main Development Push

- **Morning** - Got the foundation ready

  - Vite setup with TypeScript
  - Added Tailwind, configured paths
  - Set up RxDB with schemas

- **Midday** - Built core features

  - Created the zustand stores
  - Protected routes and auth flow
  - Dashboard with all main components

- **Afternoon/Evening** - Made it work nicely
  - Task markers on floor plan
  - Full CRUD for tasks
  - Checklist system with the 5 statuses
  - Hover effects, tooltips, all that polish

### June 18 - Testing and Refinements

- **Morning** - Better UX stuff

  - Touch handling for mobile
  - Zoom functionality
  - Refactored some components

- **Rest of the day** - Tests and fixes
  - Set up the test suite
  - Fixed TypeScript issues
  - Got to 92.71% coverage
  - Updated docs

## 🏗️ Technical Architecture

### Tech Stack

- **Frontend**: React 19.1.0 with TypeScript 5.8.3 (strict mode)
- **Database**: RxDB 16.13.0 with IndexedDB adapter
- **State Management**: Zustand 5.0.5
- **Routing**: React Router DOM 7.6.2
- **Styling**: Tailwind CSS 4.1.10
- **Build Tool**: Vite 6.3.5
- **Testing**: Vitest 3.2.3 + React Testing Library

### Project Structure

```
src/
├── components/       # React components
│   ├── auth/        # Login components
│   ├── layout/      # Layout components
│   ├── tasks/       # Task-related components
│   └── ui/          # Reusable UI components
├── db/              # Database layer (RxDB)
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── stores/          # Zustand stores
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## 🔧 Future Improvements

Given more time, I would implement:

### Features

1. **Task Filtering/Search** - Add ability to filter tasks by status or search by title
2. **Drag & Drop** - Allow repositioning tasks by dragging on the floor plan
3. **Bulk Operations** - Select multiple tasks for bulk status updates
4. **Export/Import** - Export task data to JSON/CSV for backup

### Performance

1. **Image Optimization** - Lazy loading and responsive images for floor plans
2. **Bundle Splitting** - More aggressive code splitting for faster initial load

### Testing

1. **E2E Tests** - Add Playwright/Cypress for end-to-end testing
2. **Visual Regression** - Implement visual regression testing
3. **Performance Tests** - Add performance benchmarks

### Developer Experience

1. **Storybook** - Document components in isolation
2. **CI/CD Pipeline** - Automated testing and deployment

## 🎥 Video Explanation

[Video Link] - A short walkthrough of the application demonstrating:

- User login flow
- Adding tasks to the floor plan
- Managing checklists
- Offline functionality
- Code architecture overview

## 📝 Notes

- The application uses browser's IndexedDB for storage, so data persists across sessions
- Each user's data is completely isolated
- The floor plan image is included in the public folder
- All operations work offline - no internet connection required
- Test coverage is at 92.71% with comprehensive unit tests

## 🙏 Assessment Completion

This project fulfills all the requirements specified in the assessment:

- ✅ Offline-first architecture with RxDB
- ✅ Multi-user support with data isolation
- ✅ Interactive floor plan with task placement
- ✅ Complete checklist system with 5 statuses
- ✅ Task board/list view
- ✅ TypeScript strict mode
- ✅ Zustand for state management
- ✅ React Router for navigation
- ✅ Tailwind CSS for styling
- ✅ Comprehensive test suite
