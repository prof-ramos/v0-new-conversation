# Study Dashboard - Qwen Code Context

## Project Overview

This is a comprehensive study dashboard application built with Next.js 15 + React 19, designed to help users track their study progress, manage daily tasks, and visualize their learning journey. The application features:

- **Authentication**: Secure login/registration with Supabase Auth
- **Study Tracking**: Timer-based study sessions with subject/topic selection
- **Progress Monitoring**: Checklist for exam syllabus with 17 subjects and hundreds of topics
- **Analytics**: Detailed charts and statistics for study patterns
- **Task Management**: Daily task list with time estimates, categories, and priorities
- **Responsive UI**: Modern interface using shadcn/ui components and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **UI Components**: shadcn/ui + Tailwind CSS + Radix UI
- **Backend**: Supabase (Auth + PostgreSQL)
- **Deployment**: Vercel
- **Database**: PostgreSQL with 5 tables and Row Level Security (RLS)
- **Styling**: Tailwind CSS with custom configurations
- **Icons**: Lucide React

## Project Structure

```
/app/                  -> Next.js app router pages
  /analytics/          -> Analytics and charts
  /auth/               -> Authentication pages (login/register)
  /checklist/          -> Syllabus checklist interface
  /dashboard/          -> Main dashboard with KPIs
  /study-session/      -> Study timer and session management
  /tasks/              -> Daily task management
/components/           -> Reusable UI components
  /dashboard/          -> Dashboard-specific components
  /tasks/              -> Task management components
  /ui/                 -> shadcn/ui base components
/lib/                  -> Utility libraries and services
  /supabase/           -> Supabase client configurations
/public/               -> Static assets
/supabase/migrations/  -> Database migration scripts
/docs/specs/           -> Documentation and specifications
```

## Database Schema

The application uses 5 main tables in Supabase:

1. **profiles** - User profile information
2. **materias** - 17 exam subjects (10 basic + 7 specific)
3. **topicos** - Hundreds of topics organized by subject
4. **progresso_usuario** - User progress tracking for topics
5. **sessoes_estudo** - Study session records
6. **tarefas** - Daily task management

## Development Setup

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Installation

```bash
pnpm install
```

### Development Server

```bash
pnpm dev
```

### Build for Production

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

## Key Features Implementation

### Authentication
- Protected routes using middleware
- Session management with Supabase SSR helpers
- Row Level Security (RLS) for data isolation

### Study Tracking
- Timer-based study sessions with play/pause/stop controls
- Subject and topic selection during sessions
- Automatic progress updates in the database

### Checklist System
- Interactive syllabus checklist with 17 subjects
- Progress percentage tracking per subject
- Manual progress control for topics

### Analytics Dashboard
- KPI cards showing study statistics
- Timeline charts for study evolution
- Heatmaps and distribution charts
- Performance comparison by category

### Task Management
- Daily task lists with time estimates (5-60min)
- Category filtering (study, work, personal, general)
- Priority levels (low, medium, high)
- Overdue task highlighting
- Completion percentage tracking

## Development Conventions

- **TypeScript**: Strict typing with modern ES6+ features
- **Component Structure**: Reusable components organized by feature
- **UI Library**: shadcn/ui components with Tailwind CSS
- **Data Fetching**: Server-side data fetching with Supabase client
- **Routing**: App router with protected routes
- **Styling**: Tailwind CSS with custom configurations

## Deployment

The application is configured for deployment on Vercel with automatic builds and deployments.

## Roadmap Status

The project is currently in Phase 6 (completed), with all core features implemented:
- ✅ Authentication system
- ✅ Study session tracking
- ✅ Syllabus checklist
- ✅ Analytics dashboard
- ✅ Task management
- ⏳ Pending: n8n integration for automations

## Supabase Configuration

Database setup requires running SQL migration scripts in order:
1. Create profiles table
2. Create subjects table
3. Create topics table
4. Create user progress table
5. Create study sessions table
6. Create triggers
7. Populate topics
8. Create tasks table (last)