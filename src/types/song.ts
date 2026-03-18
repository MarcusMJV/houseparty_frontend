export interface Song {
  id: string
  name: string
  artists: string[]
  album: string
  duration_ms: number
  image: { url: string; width: number; height: number }
  external_url: string
  uri: string
  explicit: boolean
}
