'use client'

import Image from 'next/image'
import { useState } from 'react'

interface MatchTrack {
  id: string
  title: string
  artist: string
  image: string | null
  spotifyUrl: string
  preview_url: string | null
}

interface MatchMemory {
  id: string
  blurb: string
  createdAt: string
}

interface SwapCardProps {
  matchMemory: MatchMemory
  matchTrack: MatchTrack
  onSendAnother: () => void
}

export default function SwapCard({ matchMemory, matchTrack, onSendAnother }: SwapCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  const handlePreview = () => {
    if (!matchTrack.preview_url) return

    if (audio) {
      audio.pause()
      audio.currentTime = 0
      setAudio(null)
      setIsPlaying(false)
      return
    }

    const newAudio = new Audio(matchTrack.preview_url)
    newAudio.play()
    setIsPlaying(true)
    setAudio(newAudio)

    newAudio.addEventListener('ended', () => {
      setIsPlaying(false)
      setAudio(null)
    })

    newAudio.addEventListener('error', () => {
      setIsPlaying(false)
      setAudio(null)
    })
  }

  return (
    <div className="w-full bg-white border border-black p-8 space-y-6">
      <div className="bg-[#ffc0cb] border border-black p-4 text-center">
        <h2 className="text-xl font-medium">you received a memory</h2>
      </div>

      <div className="flex flex-col items-center gap-6">
        {matchTrack.image && (
          <Image
            src={matchTrack.image}
            alt={matchTrack.title}
            width={200}
            height={200}
            className="border border-black"
          />
        )}

        <div className="text-center space-y-1">
          <div className="text-lg font-medium">{matchTrack.title}</div>
          <div className="text-sm">{matchTrack.artist}</div>
        </div>

        <div className="w-full p-6 bg-white border border-black">
          <p className="leading-relaxed whitespace-pre-wrap">{matchMemory.blurb}</p>
        </div>

        <div className="flex items-center gap-4">
          {matchTrack.preview_url && (
            <button
              onClick={handlePreview}
              className="px-6 py-2 btn-pink font-medium"
            >
              {isPlaying ? 'pause preview' : 'play preview'}
            </button>
          )}
          <a
            href={matchTrack.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 btn-pink font-medium"
          >
            open in spotify
          </a>
        </div>
      </div>

      <div className="pt-6 border-t border-black">
        <button
          onClick={onSendAnother}
          className="w-full py-3 btn-pink font-medium"
        >
          send another
        </button>
      </div>
    </div>
  )
}

