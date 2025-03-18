# OpenSend Login and Dashboard Application

This repository contains my implementation of the OpenSend frontend assignment, consisting of three tasks:

1. **Login Form with React and TypeScript**
2. **Conditional Routing**
3. **Dynamic Dashboard with Editable Widgets**

## !!!IMPORTANT: Assumptions Made

Due to the limited information provided about certain API endpoints and response structures:

1. **User Roles**: I've implemented the routing based on the described conditions, assuming standard JWT token structures
2. **Dashboard Editing**: Base on requirements from task 3, only Admin users can edit(include drag/drop/resize) the dashboard widgets, which mean member user can view the widget only
3. **Widget Storage**: In the absence of a widget API, I've used localStorage to persist widget configurations

## Project Structure

The project is built using Vite, React, TypeScript, RTK Query, and TailwindCSS. It uses Tanstack Router for routing and follows a clean, modular architecture.

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run the development server:
   ```bash
   pnpm run dev
   ```

## End-to-End Testing

This project uses Playwright for end-to-end testing to ensure the application works correctly across different browsers.

### Running E2E Tests

Run the tests in headless mode:

```bash
pnpm run test:e2e
```

Run tests with UI mode for visual debugging:

```bash
pnpm run test:e2e:ui
```

### Test Coverage

The E2E tests cover:

- User authentication flows
- Role-based routing
- Simple Dashboard functionality

### Browser Support

Tests run automatically on:

- Chromium
- Firefox
- WebKit (Safari)

### Configuration

Playwright is configured with:

- Automatic test server startup
- Global setup for consistent test environment
- Trace collection for failed tests

## Application Features

### Login Form (Task 1)

- Responsive design matching the provided mockup
- Form validation for email format and non-empty password
- Proper display of backend error messages
- Dark mode/light mode toggle
- RTK Query implementation for API calls

### Conditional Routing (Task 2)

Since limited information was provided about the API response structure:

- Users are routed based on their role after login
- Admin users go to the admin page
- Client users are checked for onboarding status:
  - If onboarding is not DONE, they go to the onboarding page
  - Otherwise, they go to the dashboard
- Authentication tokens are stored for persistent login

### Dynamic Dashboard (Task 3)

- Three metric widgets displayed in a responsive grid
- Widgets are draggable and resizable (using react-grid-layout)
- Widget positions and sizes persist using localStorage
- Only Admins can edit widget titles and descriptions
- Modal interfaces for adding new widgets and configuring them
- Default widget data for "Identities Provided", "Clicked", and "Opened message"

## Test Accounts

You can test the application with these accounts:

- Admin: test+admin@yopmail.com / 12345678
- Member: test+member@yopmail.com / 12345678
- Onboarding: test+onboarding@yopmail.com / 12345678

## Libraries Used

- React + TypeScript
- Redux Toolkit + RTK Query
- Tanstack Router
- TailwindCSS
- React Grid Layout (for drag-and-drop dashboard)
- React Hook Form (for form validation)
- Lucide React (for icons)
