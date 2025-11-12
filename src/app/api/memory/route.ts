import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bucketize } from '@/lib/sentiment'
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
  const matchMemory = sameSentimentMemories.length >= 10
    ? sameSentimentMemories[Math.floor(Math.random() * sameSentimentMemories.length)]
    : allMemories[Math.floor(Math.random() * allMemories.length)]

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

