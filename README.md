# Akinator Bingo Game

An AI-powered guessing game where players try to identify each other based on personalized clues generated from their answers to questions.

## How It Works

1. **Room Creation**: A host creates a room and shares the room code with other players
2. **Question Collection**: Each player answers 10 AI-generated personalized questions
3. **Target Assignment**: Players are randomly assigned to guess another player in the room
4. **Clue Requests**: Players request increasingly specific AI-generated clues about their target
5. **Guessing**: The winner is whoever identifies their target with the fewest clues

## Features

- 🎯 **AI-Generated Questions**: Dynamic, personalized questions for each player
- 🔄 **Real-time Updates**: Live player status and clue updates using Supabase real-time
- 🏆 **Leaderboard**: Track who finds their target with the fewest clues
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Beautiful gradient background with Tailwind CSS

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **AI Integration**: Ready for OpenAI API integration

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd reverse-bingo
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to your project dashboard
3. Navigate to **Settings > API** to get your keys

### 3. Create Database Schema

In your Supabase SQL editor, run the SQL from `database.sql`:

```sql
-- Copy and paste the contents of database.sql file
-- This creates the tables: rooms, players, clues
-- Plus indexes, RLS policies, and helper functions
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key_optional
```

**Required Supabase Keys:**
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous/public API key

**Optional:**
- `VITE_OPENAI_API_KEY`: For enhanced AI question and clue generation (fallback questions work without this)

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Supabase Configuration Details

### Required Database Tables

The app requires these tables in your Supabase database:

1. **rooms**: Store game rooms with status and room codes
2. **players**: Store player information, answers, and target assignments  
3. **clues**: Store AI-generated clues for each player

### Row Level Security (RLS)

The database uses RLS policies that allow public read/write access. For production use, you may want to implement more restrictive policies based on your security requirements.

### Real-time Subscriptions

The app uses Supabase real-time features for:
- Live player joining/leaving updates
- Real-time clue delivery
- Game state synchronization

## AI Integration

### Question Generation

The app includes a comprehensive AI prompt for generating personalized questions across categories:
- Hobbies & Interests
- Food & Entertainment Preferences  
- Lifestyle & Habits
- Experiences & Travel
- Personality & Values

### Clue Generation

AI-generated clues become progressively more specific based on:
- Player's answers to questions
- Number of clues already requested
- Category-specific insights

### Fallback System

The app includes fallback questions and clue generation that work without AI, ensuring the game is playable even without OpenAI API access.

## Game Flow

1. **Lobby**: Players create or join rooms using 6-character codes
2. **Question Collection**: Progressive form with 10 personalized questions
3. **Waiting Room**: Host can see player readiness and start the game
4. **Active Game**: Players request clues and make guesses
5. **Results**: Leaderboard showing winners by fewest clues used

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy Options

The built app can be deployed to:
- Vercel (recommended for Vite apps)
- Netlify
- Any static hosting service

Remember to set your environment variables in your deployment platform.

## Troubleshooting

### Common Issues

1. **Supabase Connection Errors**: Verify your URL and API key in `.env.local`
2. **Database Errors**: Ensure you've run the complete SQL schema from `database.sql`
3. **Real-time Not Working**: Check that your Supabase project has real-time enabled
4. **Questions Not Loading**: The app will use fallback questions if AI is unavailable

### Development Tips

- Use browser dev tools to monitor Supabase real-time connections
- Check the Supabase dashboard for database query logs
- Test with multiple browser tabs to simulate multiplayer experience

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with multiple players
5. Submit a pull request

## License

MIT License - feel free to use this project for your own games!
