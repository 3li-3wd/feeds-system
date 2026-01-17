# Feed Factory Admin (React + Vite)

This is the new frontend for the Feed Factory Admin system, migrated from Next.js to React + Vite.

## Getting Started

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Run the development server:
    ```bash
    npm run dev
    ```

## Project Structure

-   `src/App.tsx`: Main application component and routing logic.
-   `src/pages/`: Page components (Login, Dashboard subpages).
-   `src/components/`: Reusable UI components and layout.
-   `src/context/`: React Contexts (Auth, Settings).
-   `src/lib/api.ts`: API service layer (currently mocks, ready for backend integration).
-   `src/index.css`: Global styles (Tailwind CSS).

## Backend Integration

The backend is expected to be a Node.js + Express app with SQLite.
Connect the changes in `src/lib/api.ts` to your actual backend API endpoints.
