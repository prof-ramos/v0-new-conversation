# GEMINI.md

## Project Overview

This is a "Study Dashboard" project built with Next.js, a popular React framework. The primary goal of this application is to provide a simple and powerful panel for tracking progress on a syllabus, study evolution, and daily routine.

The project uses Tailwind CSS for styling, along with `shadcn/ui` for UI components. For the backend, it relies on Supabase for authentication and its Postgres database. The application is set up for deployment on Vercel.

## Building and Running

To get the project running locally, follow these steps:

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Set up environment variables:**
    Copy the `.env.example` file to a new file named `.env.local` and fill in the required Supabase credentials:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=
    NEXT_PUBLIC_SUPABASE_ANON_KEY=
    ```

3.  **Run the development server:**
    ```bash
    pnpm dev
    ```

The application will be available at `http://localhost:3000`.

### Other available scripts:

*   `pnpm build`: Builds the application for production.
*   `pnpm start`: Starts a production server.
*   `pnpm lint`: Lints the code.
*   `pnpm test`: Runs tests using Jest.
*   `pnpm test:watch`: Runs tests in watch mode.

## Development Conventions

*   **Framework:** The project is built with Next.js and follows its conventions, including the App Router for routing.
*   **Styling:** Styling is done with Tailwind CSS and `shadcn/ui`.
*   **Backend:** Supabase is used for the backend, including authentication and database.
*   **Testing:** The project uses Jest for testing.
*   **Code Quality:** The project is set up with ESLint for code linting.
*   **Deployment:** The project is configured for deployment on Vercel.

## Vercel Deployment Issues

The Vercel deployment might be failing due to a few reasons:

1.  **Incorrect Environment Variables:** The `README.md` file was outdated and contained incorrect environment variable names. I have updated it to use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Please ensure that these are the environment variables you are using in your Vercel project settings.

2.  **Unpinned Dependencies:** Many of the dependencies in `package.json` are set to `"latest"`. This can cause issues when new versions are released. It is recommended to pin the exact versions of the dependencies to ensure stable builds.

3.  **React 19 Beta:** The project is using React 19, which is still in beta. This might cause compatibility issues with other libraries. If the deployment issues persist, consider downgrading to a stable version of React.

## Directory Overview

*   `app/`: Contains the application's routes and pages.
*   `components/`: Contains reusable UI components.
*   `lib/`: Contains utility functions, including the Supabase client.
*   `styles/`: Contains global styles.
*   `public/`: Contains static assets.
*   `scripts/`: Contains scripts for various tasks.
*   `__tests__/`: Contains test files.
*   `supabase/migrations/`: Contains SQL migration files.
*   `docs/specs/`: Contains notes and design decisions.