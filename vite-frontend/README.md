# Spam Email Classifier - Frontend

This is the frontend application for the Spam Email Classifier project, built with React and Vite.

## Overview

This application provides a user interface for:

- Viewing and managing emails
- Analyzing email content for spam detection
- Viewing statistics about email classification
- Manually classifying emails as spam or not spam

## Technologies Used

- React 19
- Vite 6
- Bootstrap 5
- Chart.js
- React Router 7
- React Toastify
- Lottie Animations
- Axios for API requests

## Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- npm package manager

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```
   cd vite-frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```

### Development

Run the development server:

```
npm run dev
```

This will start the development server at http://localhost:5173 (or another port if 5173 is in use).

### Building for Production

Build the application:

```
npm run build
```

This will create a production-ready build in the `dist` directory.

### Previewing the Production Build

Preview the production build locally:

```
npm run preview
```

## Migration from Create React App

This project was migrated from Create React App to Vite for faster development and build times. The key changes included:

1. Setting up a Vite project structure
2. Moving API proxying from setupProxy.js to vite.config.js
3. Updating the entry point from index.js to main.jsx
4. Configuring the build process for optimized production assets

## Proxy Configuration

The application proxies API requests to the backend service running at **http://localhost:5001**. This is configured in the `vite.config.js` file.

**Important:** The backend must be running at port 5001 before starting the frontend dev server. See `DEVELOPMENT.md` in the root directory for details.

### Development Workflow

1. **Start Backend** (Terminal 1):
   ```bash
   cd ..  # Go to root directory
   python3 app.py
   ```
   Backend runs at: http://localhost:5001

2. **Start Frontend** (Terminal 2):
   ```bash
   npm run dev
   ```
   Frontend runs at: http://localhost:5173

3. **Access the app**: http://localhost:5173

The Vite dev server will automatically proxy API requests from port 5173 to the backend at port 5001.
