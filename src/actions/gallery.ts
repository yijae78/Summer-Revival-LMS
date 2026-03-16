'use server'

import { revalidatePath } from 'next/cache'

import { createServerSupabaseClient } from '@/lib/supabase/server'

interface CreateAlbumInput {
  eventId: string
  title: string
  dayNumber: number | null
}

export async function createAlbum({ eventId, title, dayNumber }: CreateAlbumInput) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('gallery_albums')
      .insert({
        event_id: eventId,
        title,
        day_number: dayNumber,
      })
      .select()
      .single()

    if (error) {
      return { error: '앨범을 만들지 못했어요.' }
    }

    revalidatePath('/gallery')
    return { success: true, data }
  } catch (e) {
    console.error('createAlbum failed:', e)
    return { error: '앨범 생성 중 오류가 발생했어요.' }
  }
}

export async function deleteAlbum(id: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // Delete photos in album first (cascade may not be set)
    const { error: photosError } = await supabase
      .from('gallery_photos')
      .delete()
      .eq('album_id', id)

    if (photosError) {
      return { error: '앨범의 사진을 삭제하지 못했어요.' }
    }

    const { error } = await supabase
      .from('gallery_albums')
      .delete()
      .eq('id', id)

    if (error) {
      return { error: '앨범을 삭제하지 못했어요.' }
    }

    revalidatePath('/gallery')
    return { success: true }
  } catch (e) {
    console.error('deleteAlbum failed:', e)
    return { error: '앨범 삭제 중 오류가 발생했어요.' }
  }
}

interface AddPhotoInput {
  albumId: string
  fileUrl: string
  thumbnailUrl: string | null
  caption: string | null
}

export async function addPhoto({ albumId, fileUrl, thumbnailUrl, caption }: AddPhotoInput) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('gallery_photos')
      .insert({
        album_id: albumId,
        file_url: fileUrl,
        thumbnail_url: thumbnailUrl,
        caption,
        uploaded_by: user?.id ?? null,
      })
      .select()
      .single()

    if (error) {
      return { error: '사진을 추가하지 못했어요.' }
    }

    revalidatePath('/gallery')
    return { success: true, data }
  } catch (e) {
    console.error('addPhoto failed:', e)
    return { error: '사진 추가 중 오류가 발생했어요.' }
  }
}

export async function deletePhoto(id: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('gallery_photos')
      .delete()
      .eq('id', id)

    if (error) {
      return { error: '사진을 삭제하지 못했어요.' }
    }

    revalidatePath('/gallery')
    return { success: true }
  } catch (e) {
    console.error('deletePhoto failed:', e)
    return { error: '사진 삭제 중 오류가 발생했어요.' }
  }
}
