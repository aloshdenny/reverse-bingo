# Quick Setup Guide

## Supabase Keys Required

To run this Akinator Bingo game, you need these **specific keys** from your Supabase project:

### 1. VITE_SUPABASE_URL
- **Where to find it**: Supabase Dashboard → Settings → API → Project URL
- **Example**: `https://your-project-ref.supabase.co`

### 2. VITE_SUPABASE_ANON_KEY  
- **Where to find it**: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (very long string)

### 3. VITE_OPENAI_API_KEY (Optional)
- **Where to get it**: OpenAI Platform → API Keys
- **Note**: Game works with fallback questions/clues if not provided

## Environment File

Create `.env.local` in your project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-very-long-anon-key...
VITE_OPENAI_API_KEY=sk-...your-openai-key... # Optional
```

## Database Setup

Copy the entire contents of `database.sql` and run it in your Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Paste all the SQL from `database.sql`
4. Click "Run"

This creates:
- Tables: `rooms`, `players`, `clues`
- Indexes for performance
- Row Level Security policies
- Helper functions

## Testing

```bash
npm install
npm run dev
```

Open multiple browser tabs to test multiplayer functionality.

## Common Issues

- **"Missing Supabase environment variables"**: Check your `.env.local` file exists and has the correct keys
- **Database errors**: Make sure you ran the complete SQL schema
- **Real-time not working**: Ensure your Supabase project has real-time enabled (it's on by default) 