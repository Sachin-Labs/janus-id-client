# 🎭 Janus ID Frontend

Janus ID is a modern, enterprise-grade Identity Engine designed for secure authentication and granular access control. This repository contains the administrative dashboard and hosted login pages.

## ✨ Features

- **🚀 Modern OAuth 2.0**: Full support for Authorization Code Flow with **PKCE** (Proof Key for Code Exchange).
- **🛡️ Secret Hardening**: Industry-standard "Show Once" security pattern for client secrets with automated Bcrypt hashing.
- **🔄 Secret Rotation**: Invalidate and regenerate application credentials with a single click.
- **🏗️ Granular RBAC**: Manage Applications, Roles, and Permissions with an intuitive mapping interface.
- **🎨 Premium Branding**: Monochromatic, geometric design language with custom iconography.
- **🔐 Hosted Login (SSO)**: A unified login experience for all your "First Party" applications.

## 🛠️ Tech Stack

- **Framework**: React.js with Vite
- **Icons**: Lucide React
- **API**: Axios with centralized service architecture
- **Deployment**: Configured for Vercel (includes `vercel.json` for SPA routing)

## 🚀 Getting Started

1.  **Clone & Install**:
    ```bash
    npm install
    ```
2.  **Environment Variables**:
    Create a `.env` file:
    ```env
    VITE_API_URL=http://localhost:8000
    ```
3.  **Run Development**:
    ```bash
    npm run dev
    ```

## 📜 Integration Flows

Janus ID supports two main integration methods:

### 1. Frontend / SPA Flow (PKCE)
The most secure flow for React, Vue, or Mobile apps. No client secret is required in the frontend code.
- Uses `code_challenge` and `code_verifier`.

### 2. Backend Flow (Standard)
For secure servers (Node, Python, Go) where you can hide your `clientSecret` safely in environment variables.

## 📝 License
Proprietary - Built by Sachin Balagam
