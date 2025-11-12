import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bucketize, wordSimilarity } from '@/lib/sentiment'
import { getTrack } from '@/lib/spotify'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { spotifyTrackId, blurb } = body

  if (!spotifyTrackId || !blurb || blurb.length > 300) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const sentiment = bucketize(blurb)
  const memoryId = crypto.randomUUID()

  const { data: memory } = await supabase
    .from('memory')
    .insert({
      id: memoryId,
      spotify_track_id: spotifyTrackId,
      blurb: blurb.trim(),
      sentiment,
    })
    .select()
    .single()

  const { data: allMemories } = await supabase
    .from('memory')
    .select('*')
    .neq('id', memory.id)

  if (!allMemories || allMemories.length === 0) {
    return NextResponse.json({ empty: true })
  }

  const sameSentimentMemories = allMemories.filter((m) => m.sentiment === sentiment)
  
  let candidates = sameSentimentMemories.length >= 5 ? sameSentimentMemories : allMemories
  
  // score by word similarity
  const scored = candidates.map(m => ({
    memory: m,
    score: wordSimilarity(blurb, m.blurb)
  }))
  
  // sort by similarity, then pick from top 50% (so it's not always the exact same)
  scored.sort((a, b) => b.score - a.score)
  const topHalf = scored.slice(0, Math.max(1, Math.floor(scored.length / 2)))
  const matchMemory = topHalf[Math.floor(Math.random() * topHalf.length)].memory

  const matchTrack = await getTrack(matchMemory.spotify_track_id)

  return NextResponse.json({
    matchMemory: {
      id: matchMemory.id,
      blurb: matchMemory.blurb,
      createdAt: matchMemory.created_at,
    },
    matchTrack,
  })
}

