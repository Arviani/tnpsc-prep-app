import { useState } from 'react'
import { uploadService } from '@/services/storage/upload.service'

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setError(null)
    try {
      // Direct upload to Supabase Storage
      const path = await uploadService.uploadFile(file)
      await uploadService.logImportHistory(file.name, path, file.size)
      return path
    } catch (e: any) {
      setError(e.message || 'Upload failed')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return { uploadFile, isUploading, error }
}
