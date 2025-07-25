-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- DROP old function if it exists
-- =========================
DROP FUNCTION IF EXISTS generate_room_code();

-- =========================
-- Create function to generate room codes
-- =========================
CREATE FUNCTION generate_room_code()
RETURNS VARCHAR(6) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result VARCHAR(6) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- Create tables
-- =========================

-- Create rooms table
DROP TABLE IF EXISTS rooms CASCADE;
CREATE TABLE rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_code VARCHAR(6) UNIQUE NOT NULL DEFAULT generate_room_code(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'collecting', 'playing', 'finished')),
  created_by UUID NOT NULL
);

-- Create players table
DROP TABLE IF EXISTS players CASCADE;
CREATE TABLE players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  answers JSONB DEFAULT '{}',
  target_player_id UUID REFERENCES players(id),
  clues_used INTEGER DEFAULT 0,
  found_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clues table
DROP TABLE IF EXISTS clues CASCADE;
CREATE TABLE clues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  clue_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- Indexes for better performance
-- =========================
CREATE INDEX idx_rooms_room_code ON rooms(room_code);
CREATE INDEX idx_players_room_id ON players(room_id);
CREATE INDEX idx_players_target_player_id ON players(target_player_id);
CREATE INDEX idx_clues_player_id ON clues(player_id);

-- =========================
-- Enable Row Level Security (RLS)
-- =========================
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE clues ENABLE ROW LEVEL SECURITY;

-- =========================
-- RLS Policies
-- =========================

-- Rooms
CREATE POLICY "Anyone can read rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create rooms" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rooms" ON rooms FOR UPDATE USING (true);

-- Players
CREATE POLICY "Anyone can read players" ON players FOR SELECT USING (true);
CREATE POLICY "Anyone can create players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update players" ON players FOR UPDATE USING (true);

-- Clues
CREATE POLICY "Anyone can read clues" ON clues FOR SELECT USING (true);
CREATE POLICY "Anyone can create clues" ON clues FOR INSERT WITH CHECK (true);