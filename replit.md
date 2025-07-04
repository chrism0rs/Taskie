# Task.CV - Gamified Task Management System

## Overview

Task.CV is a modern, gamified task management application built with React and Express.js. The system combines productivity with engagement through a point-based reward system, wellness reminders, and collaborative features. The application features a pink-themed aesthetic with a focus on user experience and motivation.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI components with custom theming
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **WebSocket**: Native WebSocket for real-time features
- **Session Management**: PostgreSQL-based session storage
- **API Design**: RESTful API with real-time WebSocket enhancements

## Key Components

### Database Schema
- **Users**: Profile management, points system, Spotify integration, custom backgrounds
- **Tasks**: Title, description, subject classification, difficulty levels, point rewards
- **Collaborations**: Friend system for collaborative task management
- **Study Sessions**: Pomodoro-style study tracking with wellness reminders

### Frontend Features
- **Task Management**: Create, complete, and organize tasks with subject filtering
- **Gamification**: Point-based reward system with celebration modals
- **Study Mode**: Pomodoro timer with wellness notifications
- **Analytics**: Task completion statistics and progress visualization
- **Calendar**: Task scheduling and due date management
- **Settings**: Profile customization and notification preferences

### Real-time Features
- **WebSocket Integration**: Live updates for task completions and user activities
- **Collaborative Notifications**: Real-time alerts for friend activities
- **Wellness Reminders**: Automated health and motivation notifications during study sessions

## Data Flow

1. **User Authentication**: Mock authentication system (placeholder for future implementation)
2. **Task Operations**: CRUD operations through REST API with real-time WebSocket updates
3. **Gamification**: Point calculations based on task difficulty and completion
4. **Study Sessions**: Timer-based wellness reminder system
5. **Analytics**: Statistical aggregation from task completion data

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL for production
- **Drizzle ORM**: Type-safe database operations
- **Connection Pooling**: Efficient database connection management

### UI/UX
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Recharts**: Data visualization for analytics
- **Lucide Icons**: Consistent iconography

### Development Tools
- **TypeScript**: Type safety across the application
- **ESBuild**: Fast bundling for production
- **Vite**: Development server with HMR

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds client-side assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations manage schema changes

### Production Configuration
- **Static Assets**: Frontend served from `dist/public`
- **API Routes**: Express server handles `/api/*` routes
- **Environment Variables**: Database URL and other configuration
- **WebSocket**: Real-time communication on same server

### Development Environment
- **Hot Module Replacement**: Vite integration for fast development
- **TypeScript Compilation**: Real-time type checking
- **Database Migrations**: `drizzle-kit push` for schema updates

## Changelog

```
Changelog:
- July 04, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```