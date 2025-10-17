# Contenov - AI Blog Content Brief Generator

An AI-powered SaaS that automatically generates professional SEO blog content briefs for content agencies and marketing teams.

## Features

- 🤖 AI-powered blog analysis
- 🎯 Comprehensive SEO strategy
- 📝 Complete blog outlines with H2/H3 recommendations
- 📤 Export to PDF, Google Docs, and Notion
- 👥 Team collaboration tools
- ⚡ Generate briefs in under 2 minutes

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
contenov-saas/
├── app/
│   ├── (marketing)/       # Landing page and login
│   ├── (dashboard)/       # Dashboard pages
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── marketing/        # Landing page components
│   └── shared/           # Shared components
├── lib/
│   └── utils.ts
├── public/
│   └── assets/
└── types/
```

## Design System

### Brand Colors

- **Primary Gradient:** Pink (#FF1B6B) → Orange (#FF8B3D) → Peach (#FFB85F)
- **Text:** #0A2540 (near-black)
- **Background:** #FFFFFF (white), #FAFAFA (light gray)
- **Borders:** #E3E8EF

### Design Philosophy

Clean, spacious, professional design inspired by Stripe. Light mode only with generous white space, rounded corners (8-12px), and subtle shadows. Gradient accents on CTAs and key elements.

## Assets

Please add the following assets to the `public/assets/` directory:

- `logo.svg` - Company logo
- `favicon.ico` - Favicon

## License

Copyright © 2024 Contenov. All rights reserved.






