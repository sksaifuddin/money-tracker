# Personal Expense Tracker

## Overview
A personal web application for visualizing spending data from a Notion database. Features monthly spending breakdowns with card-based navigation, displaying monthly overview cards with total spending and detailed transaction views.

**Current Status**: Successfully migrated from React to Next.js for Vercel deployment as an open-source project.

## Project Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database Integration**: Notion API (@notionhq/client)
- **UI Components**: Radix UI + Tailwind CSS
- **Data Fetching**: TanStack Query
- **TypeScript**: Full type safety
- **Deployment**: Vercel-ready

### Key Features
- Monthly spending overview with interactive cards
- Detailed transaction views with filtering and sorting
- Notion database integration for real-time data
- Responsive design with modern UI
- Secure API key handling for open source

### Database Schema (Notion)
- **Database Name**: "Expense tracker"
- **Key Fields**:
  - Expense (transaction name/description)
  - Date
  - Amount
  - Category
  - Merchant
  - Payment Method
  - Notes

## Recent Changes

### 2025-01-02: Next.js Migration Complete
✓ Converted from React app to Next.js App Router structure
✓ Created API routes for monthly and detailed transaction data
✓ Implemented proper TypeScript configuration for Next.js
✓ Added React imports to fix JSX compilation issues
✓ Created monthly overview page with interactive cards
✓ Built detailed month view with transaction table
✓ Added filtering, sorting, and search functionality
✓ Configured Tailwind CSS and shadcn/ui components
✓ Set up proper error handling and loading states

### Environment Variables Required
- `NOTION_INTEGRATION_SECRET`: Notion integration token
- `NOTION_PAGE_URL`: URL of the parent Notion page containing the database

## User Preferences
- Use "Expense" column from Notion as the primary transaction name
- Prefer card-based UI for monthly navigation
- Need proper security handling for API keys in open source deployment
- Focus on Vercel deployment compatibility

## Next Steps
- Deploy to Vercel with secure environment variable handling
- Add GitHub integration for open source repository
- Consider adding data visualization charts
- Implement responsive design optimizations

## File Structure
```
app/
├── api/
│   ├── health/route.ts
│   └── transactions/
│       ├── monthly/route.ts
│       └── month/[year]/[month]/route.ts
├── components/
│   ├── ui/ (shadcn components)
│   ├── monthly-card.tsx
│   ├── transaction-table.tsx
│   └── providers/query-provider.tsx
├── lib/
│   ├── notion.ts
│   ├── types.ts
│   └── utils.ts
├── month/[year]/[month]/page.tsx
├── layout.tsx
├── page.tsx
└── globals.css
```