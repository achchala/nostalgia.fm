import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
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
      return NextResponse.json({ error: 'Blurb is required' }, { status: 400 })
    }

    if (blurb.length > 300) {
      return NextResponse.json({ error: 'Blurb must be ≤300 characters' }, { status: 400 })
    }

    const sentiment = bucketize(blurb)

    const memory = await prisma.memory.create({
      data: {
        spotifyTrackId,
        blurb: blurb.trim(),
        sentiment,
      },
    })

    const allMemories = await prisma.memory.findMany({
      where: {
        id: { not: memory.id },
      },
    })

    if (allMemories.length === 0) {
      return NextResponse.json({ empty: true })
    }

    const sameSentimentMemories = allMemories.filter((m: { sentiment: number }) => m.sentiment === sentiment)
    let matchMemory

    if (sameSentimentMemories.length >= 10) {
      matchMemory = sameSentimentMemories[Math.floor(Math.random() * sameSentimentMemories.length)]
    } else {
      matchMemory = allMemories[Math.floor(Math.random() * allMemories.length)]
    }

    const matchTrack = await getTrack(matchMemory.spotifyTrackId)

    return NextResponse.json({
      matchMemory: {
        id: matchMemory.id,
        blurb: matchMemory.blurb,
        createdAt: matchMemory.createdAt,
      },
      matchTrack,
    })
  } catch (error) {
    console.error('Memory creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create memory' },
      { status: 500 }
    )
  }
}

