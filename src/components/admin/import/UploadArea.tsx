import React, { useCallback, useState } from 'react'
import { UploadCloud, FileType, CheckCircle2 } from 'lucide-react'

interface UploadAreaProps {
  onUpload: (file: File) => void
  isUploading: boolean
}

export function UploadArea({ onUpload, isUploading }: UploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragOver(true)
    } else if (e.type === 'dragleave') {
      setIsDragOver(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0])
    }
  }, [onUpload])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0])
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
        isDragOver ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="flex justify-center mb-6">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
          <UploadCloud className="h-10 w-10 text-primary" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">Upload Question Paper</h3>
      <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
        Drag and drop your scanned PDF, Text, Markdown, or JSON file here, or click to browse.
      </p>

      <label className="relative cursor-pointer">
        <span className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors inline-block">
          {isUploading ? 'Uploading...' : 'Select File'}
        </span>
        <input
          type="file"
          className="hidden"
          accept=".pdf,.txt,.md,.json"
          onChange={handleChange}
          disabled={isUploading}
        />
      </label>

      <div className="mt-12 grid grid-cols-4 gap-4 max-w-2xl mx-auto">
        {[
          { icon: FileType, label: 'PDF', desc: 'Scanned or Text' },
          { icon: FileType, label: 'TXT', desc: 'Plain Text' },
          { icon: FileType, label: 'MD', desc: 'Markdown' },
          { icon: FileType, label: 'JSON', desc: 'Structured Data' }
        ].map((type, i) => (
          <div key={i} className="flex flex-col items-center p-4 rounded-lg bg-muted/50">
            <type.icon className="h-6 w-6 text-muted-foreground mb-2" />
            <span className="font-medium text-sm">{type.label}</span>
            <span className="text-xs text-muted-foreground">{type.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
