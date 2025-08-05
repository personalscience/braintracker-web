# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint with TypeScript support
- `npm run preview` - Preview production build locally

### Environment Setup
- Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables
- Uses Supabase for authentication and data storage
- Database migrations are in `supabase/migrations/`

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router DOM

### Application Structure

**Core Components:**
- `src/contexts/AuthContext.tsx` - Global authentication state management with Supabase
- `src/components/ProtectedRoute.tsx` - Route protection for authenticated users
- `src/components/Layout.tsx` - Main app layout with navigation

**Main Pages:**
- `src/pages/LandingPage.tsx` - Public landing page
- `src/pages/Login.tsx` - Authentication (sign in/up)
- `src/pages/Dashboard.tsx` - Main user dashboard with test history and charts
- `src/pages/Test.tsx` - Brain reaction time testing interface with stimulus/response logic
- `src/pages/History.tsx` - Historical test results and data visualization
- `src/pages/Profile.tsx` - User profile management

**Key Features:**
- **Test System**: Implements Seth Roberts' brain reaction time protocol with warmup (5 trials) and full test (20 trials) modes
- **Data Collection**: Stores reaction times, conditions, notes in `brain_tests` table
- **User Profiles**: Auto-created on signup in `profiles` table
- **Real-time Testing**: Uses performance.now() for precise timing measurements

### Database Schema
- `profiles` table: User profile data linked to Supabase auth
- `brain_tests` table: Test results with reaction times array, averages, conditions, and notes
- Row Level Security (RLS) enabled for user data isolation

### Authentication Flow
- Supabase handles authentication with automatic profile creation
- Protected routes require authentication
- Context provider manages auth state globally

### Testing Interface
The test implementation in `src/pages/Test.tsx` follows the original Seth Roberts protocol:
- Random stimulus delay (1-4 seconds)
- Visual stimulus (red circle)
- Keyboard (spacebar) or click response
- Early click detection and handling
- Performance timing for accuracy