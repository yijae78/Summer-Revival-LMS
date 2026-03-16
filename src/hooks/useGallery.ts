'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query-keys'
import { useDemoStore } from '@/stores/demoStore'
import { DEMO_ALBUMS, DEMO_PHOTOS } from '@/lib/demo/data'
import { createDemoQueryResult } from '@/lib/demo/hooks'

import type { GalleryAlbum, GalleryPhoto } from '@/types'

export function useAlbums(eventId: string | null) {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)

  const query = useQuery({
    queryKey: queryKeys.albums(eventId!),
    queryFn: async () => {
      const supabase = getSupabaseClient()
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
    enabled: eventId !== null && !isDemoMode,
  })

  if (isDemoMode) {
    const albumsWithCount = DEMO_ALBUMS.map((album) => ({
      ...album,
      photoCount: DEMO_PHOTOS.filter((p) => p.album_id === album.id).length,
    }))
    return createDemoQueryResult(albumsWithCount)
  }

  return query
}

export function usePhotos(albumId: string | null) {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)

  const query = useQuery({
    queryKey: queryKeys.photos(albumId!),
    queryFn: async () => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('album_id', albumId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as GalleryPhoto[]
    },
    enabled: albumId !== null && !isDemoMode,
  })

  if (isDemoMode) {
    const photos = DEMO_PHOTOS.filter((p) => p.album_id === albumId)
    return createDemoQueryResult(photos)
  }

  return query
}
