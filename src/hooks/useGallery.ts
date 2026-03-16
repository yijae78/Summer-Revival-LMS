'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { queryKeys } from '@/lib/query-keys'
import { useAppModeStore } from '@/stores/appModeStore'
import { DEMO_ALBUMS, DEMO_PHOTOS } from '@/lib/demo/data'
import { createDemoQueryResult } from '@/lib/demo/hooks'
import { getAll } from '@/lib/local-db'

import type { GalleryAlbum, GalleryPhoto } from '@/types'

export function useAlbums(eventId: string | null) {
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: queryKeys.albums(eventId!),
    queryFn: async () => {
      if (mode === 'local') {
        const albums = getAll<GalleryAlbum>('gallery_albums').filter(
          (a) => a.event_id === eventId
        )
        const photos = getAll<GalleryPhoto>('gallery_photos')
        return albums
          .sort((a, b) => (a.day_number ?? 0) - (b.day_number ?? 0))
          .map((album) => ({
            ...album,
            photoCount: photos.filter((p) => p.album_id === album.id).length,
          }))
      }

      const supabase = getSupabaseClient()!
      const { data, error } = await supabase
        .from('gallery_albums')
        .select('*, gallery_photos(id)')
        .eq('event_id', eventId!)
        .order('day_number', { ascending: true })
      if (error) throw error
      return (data ?? []).map((album) => ({
        ...album,
        photoCount: Array.isArray(album.gallery_photos)
          ? album.gallery_photos.length
          : 0,
      })) as (GalleryAlbum & { photoCount: number })[]
    },
    enabled: eventId !== null && (mode === 'local' || (mode === 'cloud' && isSupabaseConfigured())),
  })

  if (mode === 'demo') {
    const albumsWithCount = DEMO_ALBUMS.map((album) => ({
      ...album,
      photoCount: DEMO_PHOTOS.filter((p) => p.album_id === album.id).length,
    }))
    return createDemoQueryResult(albumsWithCount)
  }

  return query
}

export function usePhotos(albumId: string | null) {
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: queryKeys.photos(albumId!),
    queryFn: async () => {
      if (mode === 'local') {
        return getAll<GalleryPhoto>('gallery_photos')
          .filter((p) => p.album_id === albumId)
          .sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
      }

      const supabase = getSupabaseClient()!
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('album_id', albumId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as GalleryPhoto[]
    },
    enabled: albumId !== null && (mode === 'local' || (mode === 'cloud' && isSupabaseConfigured())),
  })

  if (mode === 'demo') {
    const photos = DEMO_PHOTOS.filter((p) => p.album_id === albumId)
    return createDemoQueryResult(photos)
  }

  return query
}
