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

function filterByDepartment(albums: GalleryAlbum[], department?: string): GalleryAlbum[] {
  if (!department || department === 'all') return albums
  return albums.filter((a) => !a.department || a.department === department)
}

export function useAlbums(eventId: string | null, department?: string) {
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: queryKeys.albums(eventId!, department),
    queryFn: async () => {
      if (mode === 'local') {
        let albums = getAll<GalleryAlbum>('gallery_albums').filter(
          (a) => a.event_id === eventId
        )
        albums = filterByDepartment(albums, department)
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
      const allAlbums = (data ?? []).map((album) => ({
        ...album,
        photoCount: Array.isArray(album.gallery_photos)
          ? album.gallery_photos.length
          : 0,
      })) as (GalleryAlbum & { photoCount: number })[]
      return filterByDepartment(allAlbums, department) as (GalleryAlbum & { photoCount: number })[]
    },
    enabled: eventId !== null && (mode === 'local' || (mode === 'cloud' && isSupabaseConfigured())),
  })

  if (mode === 'demo') {
    const filteredAlbums = filterByDepartment(DEMO_ALBUMS, department)
    const albumsWithCount = filteredAlbums.map((album) => ({
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
