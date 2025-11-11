// spotify api stuff

interface SpotifyToken {
  access_token: string
  token_type: string
  expires_in: number
}

interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string; height: number; width: number }>
  }
  preview_url: string | null
  external_urls: {
    spotify: string
  }
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[]
  }
}

let tokenCache: { token: string; expiresAt: number } | null = null

async function getSpotifyToken(): Promise<string> {
  const now = Date.now()

  if (tokenCache && now < tokenCache.expiresAt) {
    return tokenCache.token
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured')
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error(`Spotify token request failed: ${response.statusText}`)
  }

  const data: SpotifyToken = await response.json()

  // cache with 5min buffer
  tokenCache = {
    token: data.access_token,
    expiresAt: now + (data.expires_in - 300) * 1000,
  }

  return data.access_token
}

export async function searchTracks(query: string) {
  const token = await getSpotifyToken()

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Spotify search failed: ${response.statusText}`)
  }

  const data: SpotifySearchResponse = await response.json()

  return data.tracks.items.map((track) => ({
    id: track.id,
    name: track.name,
    artist: track.artists.map((a) => a.name).join(', '),
    image: track.album.images[0]?.url || null,
    preview_url: track.preview_url,
  }))
}

export async function getTrack(id: string) {
  const token = await getSpotifyToken()

  const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Spotify track fetch failed: ${response.statusText}`)
  }

  const track: SpotifyTrack = await response.json()

  return {
    id: track.id,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(', '),
    image: track.album.images[0]?.url || null,
    spotifyUrl: track.external_urls.spotify,
    preview_url: track.preview_url,
  }
}

