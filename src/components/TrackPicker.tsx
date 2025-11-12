'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface Track {
  id: string
  name: string
  artist: string
  image: string | null
  preview_url: string | null
}

interface TrackPickerProps {
  onSelect: (track: Track) => void
  selectedTrack: Track | null
}

export default function TrackPicker({ onSelect, selectedTrack }: TrackPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/track-search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data.tracks || [])
        } else {
          setResults([])
        }
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="search a song or artist…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-3 text-base border border-black focus:outline-none"
      />

      {selectedTrack && (
        <div className="mt-4 p-4 bg-white border border-black">
          <div className="flex items-center gap-4">
            {selectedTrack.image && (
              <Image
                src={selectedTrack.image}
                alt={selectedTrack.name}
                width={64}
                height={64}
                className="border border-black"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{selectedTrack.name}</div>
              <div className="text-sm truncate">{selectedTrack.artist}</div>
            </div>
          </div>
        </div>
      )}

      {!selectedTrack && query && (
        <div className="mt-2 bg-white border border-black overflow-hidden">
          {loading ? (
            <div className="p-4 text-center">searching...</div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-black">
              {results.map((track) => (
                <button
                  key={track.id}
                  onClick={() => {
                    onSelect(track)
                    setQuery('')
                    setResults([])
                  }}
                  className="w-full p-4 flex items-center gap-4 hover:bg-[#ffc0cb] transition-colors text-left"
                >
                  {track.image ? (
                    <Image
                      src={track.image}
                      alt={track.name}
                      width={48}
                      height={48}
                      className="border border-black flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-white border border-black flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{track.name}</div>
                    <div className="text-sm truncate">{track.artist}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">no results found</div>
          )}
        </div>
      )}
    </div>
  )
}

