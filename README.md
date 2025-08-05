# Brain Reaction Time Tracker

A modern web application for measuring brain reaction time based on Seth Roberts' self-experimentation protocol. Built with React, TypeScript, and Supabase.

This application was automatically generated from Seth Roberts' original R code at [github@personalscience/braintracker] https://github.com/personalscience/braintracker.

View a running version of this web app at [brt.personalscience.com](https://brt.personalscience.com).


## Overview

Seth Roberts was an early self-experimenter who developed brain reaction time testing as a way to measure cognitive performance, which he believed was correlated with many important aspects of health and well-being. This application implements his protocol in a modern web interface.

## Features

- **Reaction Time Testing**: Implements the original Seth Roberts protocol with warmup (5 trials) and full test (20 trials) modes
- **Precise Timing**: Uses `performance.now()` for accurate millisecond measurements
- **User Authentication**: Secure user accounts with Supabase Auth
- **Data Visualization**: Charts and graphs to track performance over time using Recharts
- **Test History**: Complete historical record of all test sessions
- **User Profiles**: Personal profile management and settings
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd brain-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

### Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run lint` - Run ESLint with TypeScript support
- `npm run preview` - Preview production build locally

## How to Use

1. **Sign Up/Login**: Create an account or sign in to access the testing interface
2. **Warmup**: Start with a 5-trial warmup session to get familiar with the interface
3. **Full Test**: Complete a 20-trial test session for meaningful data
4. **View Results**: Check your reaction times and performance trends in the dashboard
5. **Track Progress**: Use the history page to analyze your performance over time

## Technical Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router DOM

### Database Schema
- `profiles` table: User profile data linked to Supabase auth
- `brain_tests` table: Test results with reaction times array, averages, conditions, and notes
- Row Level Security (RLS) enabled for user data isolation

### Key Components
- **Test Interface**: Implements random stimulus delay (1-4 seconds), visual stimulus (red circle), and keyboard/click response detection
- **Authentication Flow**: Supabase handles authentication with automatic profile creation
- **Data Collection**: Stores reaction times, test conditions, and user notes
- **Visualization**: Real-time charts showing performance trends and statistics

## Research Background

Seth Roberts published several examples of insights gained from brain reaction time tracking:

Roberts, S. (2004). Self-experimentation as a source of new ideas: Ten examples about sleep, mood, health, and weight. Retrieved from http://www.escholarship.org/uc/item/2xc2h866

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting: `npm run lint`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue on the GitHub repository.