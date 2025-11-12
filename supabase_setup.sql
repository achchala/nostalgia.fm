-- Run this SQL in your Supabase SQL Editor to create the memory table

CREATE TABLE
IF NOT EXISTS memory
(
  id TEXT PRIMARY KEY,
  spotify_track_id TEXT NOT NULL,
  blurb VARCHAR
(300) NOT NULL,
  sentiment INTEGER NOT NULL,
  created_at TIMESTAMP
WITH TIME ZONE DEFAULT NOW
()
);

-- Enable Row Level Security (optional, for public access)
ALTER TABLE memory ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read and insert (since it's anonymous)
CREATE POLICY "Allow public read" ON memory FOR
SELECT USING (true);
CREATE POLICY "Allow public insert" ON memory FOR
INSERT WITH CHECK
    (true)
;

