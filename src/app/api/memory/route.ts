import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { bucketize } from '@/lib/sentiment'
import { getTrack } from '@/lib/spotify'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { spotifyTrackId, blurb } = body

    if (!spotifyTrackId || typeof spotifyTrackId !== 'string') {
      return NextResponse.json({ error: 'Invalid spotifyTrackId' }, { status: 400 })
    }

    if (!blurb || typeof blurb !== 'string' || blurb.trim().length === 0) {
      return NextResponse.json({ error: 'memory is required' }, { status: 400 })
    }

    if (blurb.length > 300) {
      return NextResponse.json({ error: 'memory must be ≤300 characters' }, { status: 400 })
    }

    const sentiment = bucketize(blurb)

    const memoryId = crypto.randomUUID()

    const { data: memory, error: insertError } = await supabase
      .from('memory')
      .insert({
        id: memoryId,
        spotify_track_id: spotifyTrackId,
        blurb: blurb.trim(),
        sentiment,
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    const { data: allMemories, error: fetchError } = await supabase
      .from('memory')
      .select('*')
      .neq('id', memory.id)

    if (fetchError) {
      throw fetchError
    }

    if (!allMemories || allMemories.length === 0) {
      return NextResponse.json({ empty: true })
    }

    const sameSentimentMemories = allMemories.filter((m) => m.sentiment === sentiment)
    let matchMemory

    if (sameSentimentMemories.length >= 10) {
      matchMemory = sameSentimentMemories[Math.floor(Math.random() * sameSentimentMemories.length)]
    } else {
      matchMemory = allMemories[Math.floor(Math.random() * allMemories.length)]
    }

    const matchTrack = await getTrack(matchMemory.spotify_track_id)

    return NextResponse.json({
      matchMemory: {
        id: matchMemory.id,
        blurb: matchMemory.blurb,
        createdAt: matchMemory.created_at,
      },
      matchTrack,
    })
  } catch (error) {
    console.error('Memory creation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to create memory: ${errorMessage}` },
      { status: 500 }
    )
  }
}

