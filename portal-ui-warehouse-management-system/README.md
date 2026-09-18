## Tech Stack
# React + TypeScript + Vite +  zod +  tailwind   +  tanstack query + tanstack router

# Inventory Management System

Aplikasi web untuk **management inventory** yang dibangun menggunakan React dan ekosistem TypeScript modern. Aplikasi ini dirancang dengan struktur modular agar mudah dikembangkan, dirawat, dan di-scale.


## Features

- Inventory management
- Data fetching & caching dengan TanStack Query
- Validasi data menggunakan Zod
- Type-safe routing dengan TanStack Router
- Responsive UI menggunakan Tailwind CSS
- Modular dan scalable project structure

## Project Structure

```text
src/
├── api/              # API layer
├── assets/           # Static assets
├── components/
│   ├── layout/       # Layout components
│   ├── shared/       # Reusable components
│   └── ui/           # UI components
├── features/         # Feature-based modules
├── lib/              # Utility & library configuration
├── mock/             # Mock/seed data
├── providers/        # Application providers
├── routes/           # TanStack Router routes
├── schemas/          # Zod schemas
├── styles/            # Global styles
├── test/             # Testing
├── types/            # Shared TypeScript types
├── main.tsx          # Application entry point
└── routeTree.gen.ts  # Generated route tree

```


Getting Started
Clone atau masuk ke folder project:

cd nama-folder-project

Install dependencies:

npm install

Jalankan development server:

npm run dev

Setelah itu buka URL yang diberikan oleh Vite di terminal.

