# SINA Auth Client

SINA Auth is a self-hosted identity provider (IdP). This repository contains the front-end application: the admin console for managing OAuth applications and access control, plus the hosted sign-in and consent pages used by client applications.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Routes](#routes)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Integration Guide](#integration-guide)
- [Theming](#theming)
- [Deployment](#deployment)
- [License](#license)

## Features

- **Admin Console** — create and manage OAuth applications, roles, permissions, users, and role-permission mappings.
- **Hosted SSO** — sign-in, sign-up, OTP verification, forgot/reset password, and OAuth consent screens for client applications.
- **OAuth 2.0** — Authorization Code flow with PKCE support for public clients.
- **Secret Rotation** — regenerate application client secrets from the console.
- **Show-Once Pattern** — client secrets are displayed in plaintext exactly once after creation.
- **Light/Dark Themes** — persistent theme preference with a toggle across all pages.
- **Landing Page** — product overview and documentation of the supported integration flows.

## Tech Stack

- React 19
- Vite 7
- React Router v7
- Axios (with interceptors for token refresh on 401)
- Lucide React (icons)
- Figtree (UI font, loaded via Google Fonts)

## Project Structure

```
src/
├── components/        # Reusable UI (Button, Input, Modal, ThemeToggle)
├── context/           # Auth and Theme providers
├── layouts/           # AuthLayout (auth pages), DashboardLayout (admin shell)
├── pages/             # Route components
├── services/          # Axios instance and OAuth helpers
└── styles/            # Design tokens (variables.css) and global styles
```

## Routes

| Path                | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| `/`                 | Public landing page.                                         |
| `/login`            | Admin login.                                                 |
| `/signup`           | Admin registration (OTP flow).                               |
| `/verify-otp`       | OTP verification.                                            |
| `/user-login`       | End-user login (hosted SSO entry point for client apps).     |
| `/user-register`    | End-user registration within an application's OAuth context. |
| `/forgot-password`  | Request a password-reset OTP.                                |
| `/reset-password`   | Reset password with OTP.                                     |
| `/authorize`        | OAuth consent screen (hosted for client applications).       |
| `/admin`            | Admin console — application list.                            |
| `/admin/apps/:appId`| Admin console — application details (roles, permissions, users, integration). |
| `/profile`          | End-user profile.                                            |

## Setup

Requirements: Node.js 18+.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Run in development
npm run dev
```

## Environment Variables

| Variable        | Required | Description                                    |
| --------------- | -------- | ---------------------------------------------- |
| `VITE_API_URL`  | Yes      | Base URL of the SINA Auth backend, e.g. `http://localhost:8000`. |

The Axios client prefixes API calls with `${VITE_API_URL}/api`. A request interceptor attaches the stored access token; a response interceptor attempts a token refresh once on a 401 and redirects to `/login` if refresh fails.

## Integration Guide

SINA Auth supports two OAuth 2.0 integration methods for client applications.

### 1. Frontend / SPA Flow (PKCE)

Recommended for browser-based and mobile apps where a client secret cannot be kept safe. No secret is shipped to the client.

1. Generate a `codeVerifier` and derive a `codeChallenge` (S256).
2. Redirect the user to `SINA_AUTH_URL/user-login?clientId=<id>&redirectUri=<uri>&state=<state>`.
3. SINA Auth authenticates the user and issues an authorization code to `redirectUri`.
4. Exchange the code at `SINA_AUTH_URL/api/auth/token` with the `codeVerifier` to receive an `accessToken` and `refreshToken`.

### 2. Backend Flow (Standard)

Recommended for server-side applications that can store a client secret in environment variables.

1. Redirect the user to the hosted login with `clientId` and `redirectUri`.
2. After the authorization code is returned, exchange it at `/api/auth/token` using `clientId` and `clientSecret`.
3. Store the returned tokens server-side.

Both flows issue JWTs that include the user's resolved permissions for the application.

## Theming

The application uses CSS custom properties defined in `src/styles/variables.css`. A `data-theme` attribute on the root element selects between `dark` (default palette) and `light` themes.

- The default theme is light.
- The user's selection is stored in `localStorage` under `sina_auth_theme`.
- An inline script in `index.html` applies the theme before first paint to avoid a flash of the wrong theme.
- `ThemeToggle` is available on the landing page, auth pages, and the admin shell.

## Deployment

The project ships with a `vercel.json` that rewrites all routes to `index.html`, enabling client-side routing on Vercel.

Build locally with:

```bash
npm run build
npm run preview
```

Set `VITE_API_URL` to your deployed backend URL during build.

## License

Proprietary. Built by Sachin Balagam.
