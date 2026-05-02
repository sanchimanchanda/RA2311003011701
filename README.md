# Campus Notifications System - Placement Assignment

**Live Demo**: [https://campusnotify.vercel.app/](https://campusnotify.vercel.app/)

This is my submission for the frontend engineering placement round. It's a Campus Notifications System built with Next.js and Material UI that fetches, filters, and prioritizes different types of campus notifications (Events, Results, Placements).

## Features Built
- **Priority Engine**: Implemented a custom Min-Heap data structure to rank unread notifications. Placements get the highest priority, then Results, then Events. Recency (timestamp) is used as a tie-breaker.
- **API Proxy**: I ran into CORS issues with the provided external evaluation API blocking browser requests, so I built Next.js server-side route handlers (`/api/*`) to proxy all requests safely from the server.
- **Logging Middleware**: Built a centralized logger that sends structured logs to the evaluation `/logs` endpoint. It handles token authentication server-side to avoid pre-auth 400 errors and auto-truncates messages to stay under the 48-character API limit.
- **UI/UX**: Responsive dark theme using MUI v6 with filter chips and pagination. Unread notifications are visually distinct and can be toggled to read.

## Tech Stack
- Next.js 14 (App Router)
- React 19
- Material UI (MUI) v6
- TypeScript

## How to run locally

1. Clone the repo and navigate to the frontend directory:
   ```bash
   cd notification_app_fe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser. 

*Note: The evaluation API credentials are hardcoded into the server-side proxy routes, so the app will handle the required authentication automatically on load.*
