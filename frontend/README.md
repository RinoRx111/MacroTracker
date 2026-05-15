# MacroTracker Frontend

Professional nutrition and macro tracking application frontend built with React + Vite.

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── api/           # API client modules
│   ├── components/    # React components
│   │   ├── ui/       # Base UI components
│   │   ├── layout/   # Layout components
│   │   ├── dashboard/# Dashboard components
│   │   ├── charts/   # Chart components
│   │   └── food/     # Food-related components
│   ├── pages/        # Page components
│   ├── hooks/        # Custom React hooks
│   ├── utils/        # Utility functions
│   ├── store/        # State management
│   ├── styles/       # Global styles
│   ├── App.jsx       # Main app component
│   └── main.jsx      # Entry point
├── index.html        # HTML template
├── vite.config.js    # Vite configuration
├── tailwind.config.js# TailwindCSS configuration
└── package.json      # Dependencies
```

## Key Technologies

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Framer Motion** - Animations

## Development

### Environment Variables

Create a `.env` file:
```
VITE_API_URL=http://localhost:8000/api/v1
```

### Hot Module Replacement

Vite automatically hot-reloads changes during development.

## Building

```bash
npm run build
```

Output is in `dist/` directory.

## Features

- 📊 Nutrition dashboard with real-time tracking
- 🍽️ Food logging with search and custom foods
- 📈 Analytics and insights
- 👤 User profile and settings
- 🌙 Dark mode support
- 📱 Responsive mobile design
- 💾 Local storage for app state
