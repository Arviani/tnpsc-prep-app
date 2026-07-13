import { createClient } from '@/lib/supabase/client'

export class UploadService {
  /**
   * Generates a storage path for the uploaded file.
   */
  generatePath(filename: string): string {
    const year = new Date().getFullYear()
    const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    return `${year}/${cleanName}`
  }

  /**
   * Uploads a file to Supabase Storage.
   */
  async uploadFile(file: File): Promise<string> {
    const supabase = createClient()
    const path = this.generatePath(file.name)

    const { data, error } = await supabase.storage
      .from('question-papers')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (error) {
      console.error('Upload Error:', error)
      throw new Error(`Failed to upload file: ${error.message}`)
    }

    return data.path
  }

  /**
   * Insert metadata record into import_history
   */
  async logImportHistory(filename: string, path: string, fileSize: number) {
    const supabase = createClient()
    const file_type = filename.split('.').pop()?.toUpperCase() ?? 'UNKNOWN'

    const { data, error } = await (supabase as any)
      .from('import_history')
      .insert({
        filename,
        file_type,
        status: 'uploaded',
      })
      .select()
      .single()

    if (error) {
      console.error('Import History Logging Error:', error)
      // We don't throw here to avoid blocking the main pipeline just for logging
    }

    return data
  }
}

export const uploadService = new UploadService()
