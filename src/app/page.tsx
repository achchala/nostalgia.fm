'use client'

import { useState } from 'react'
import TrackPicker from '@/components/TrackPicker'
import SwapCard from '@/components/SwapCard'

interface Track {
  id: string
  name: string
  artist: string
  image: string | null
  preview_url: string | null
}

interface MatchResult {
  matchMemory: {
    id: string
    blurb: string
    createdAt: string
  }
  matchTrack: {
    id: string
    title: string
    artist: string
    image: string | null
    spotifyUrl: string
    preview_url: string | null
  }
}

export default function Home() {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [blurb, setBlurb] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [isEmpty, setIsEmpty] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTrack || !blurb.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spotifyTrackId: selectedTrack.id,
          blurb: blurb.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to submit memory')
        return
      }

      const data = await response.json()

      if (data.empty) {
        setIsEmpty(true)
        setMatchResult(null)
      } else {
        setIsEmpty(false)
        setMatchResult(data)
      }
    } catch (error) {
      alert('Failed to submit memory')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendAnother = () => {
    setSelectedTrack(null)
    setBlurb('')
    setMatchResult(null)
    setIsEmpty(false)
  }

  if (matchResult) {
    return (
      <div className="w-full">
        <SwapCard
          matchMemory={matchResult.matchMemory}
          matchTrack={matchResult.matchTrack}
          onSendAnother={handleSendAnother}
        />
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="w-full bg-white border border-black p-12 text-center space-y-6">
        <h2 className="text-2xl font-medium">you&apos;re the first</h2>
        <p className="leading-relaxed">
          you&apos;re the first. come back soon to see someone else&apos;s story.
        </p>
        <button
          onClick={handleSendAnother}
          className="px-8 py-3 btn-pink font-medium"
        >
          send another
        </button>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="bg-[#ffc0cb] border border-black p-4 text-center">
        <h1 className="text-2xl font-medium">nostalgia.fm</h1>
      </div>

      <div className="bg-white border border-black p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-medium">every song has a story{'<3'}</h2>
          <p className="text-sm">
            pick a song, write your memory associated with it, and get one back
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <TrackPicker onSelect={setSelectedTrack} selectedTrack={selectedTrack} />

          {selectedTrack && (
            <>
              <div>
                <textarea
                  placeholder="what does this song remind you of?"
                  value={blurb}
                  onChange={(e) => setBlurb(e.target.value)}
                  maxLength={300}
                  rows={6}
                  className="w-full px-4 py-3 text-base border border-black resize-none focus:outline-none"
                  required
                />
                <div className="mt-2 text-right text-xs">
                  {blurb.length}/300
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !blurb.trim()}
                className="w-full py-3 btn-pink font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'sending...' : 'send memory & receive one'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
