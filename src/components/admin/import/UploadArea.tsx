import React, { useCallback, useState } from 'react'
import { UploadCloud, FileType, CheckCircle2 } from 'lucide-react'

interface UploadAreaProps {
  onUpload: (file: File, exam: string, year: string, part: string) => void
  isUploading: boolean
}

export function UploadArea({ onUpload, isUploading }: UploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [exam, setExam] = useState('')
  const [year, setYear] = useState('')
  const [part, setPart] = useState('')

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

    if (!exam || !year || !part) {
      alert("Please enter Exam, Year and Part before uploading.")
      return
    }

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0], exam, year, part)
    }
  }, [onUpload, exam, year, part])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!exam || !year || !part) {
      alert("Please enter Exam, Year and Part before uploading.")
      return
    }
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0], exam, year, part)
    }
  }

  const handleDownloadSample = (e: React.MouseEvent) => {
    e.stopPropagation()
    const sampleText = `1. Which of the following is the capital of Tamil Nadu?
(A) Madurai
(B) Coimbatore
(C) Chennai
(D) Trichy
Answer: (C)

2. Who wrote the Thirukkural?
(A) Kambar
(B) Thiruvalluvar
(C) Ilango Adigal
(D) Avvaiyar
Answer: (B)`
    
    const blob = new Blob([sampleText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Sample_Format.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-6 md:p-8 text-center transition-all duration-200 ${
        isDragOver ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="flex justify-center mb-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <UploadCloud className="h-8 w-8 text-primary" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-1">Upload Question Paper</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
        First, enter the exam, year, and part for these questions. Then drag and drop your file here, or click to browse.
      </p>

      <div className="flex flex-col gap-3 justify-center items-center mb-6 max-w-md mx-auto">
        <input 
          type="text" 
          placeholder="Exam (e.g. Group 4 Paper)" 
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={exam}
          onChange={e => setExam(e.target.value)}
        />
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <input 
            type="number" 
            placeholder="Year (e.g. 2025)" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={year}
            onChange={e => setYear(e.target.value)}
          />
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={part}
            onChange={e => setPart(e.target.value)}
          >
            <option value="" disabled>Select Part</option>
            <option value="Part A - General Tamil">Part A - General Tamil</option>
            <option value="Part B - General Studies">Part B - General Studies</option>
            <option value="Part C - Aptitude and Mental Ability">Part C - Aptitude and Mental Ability</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <label className="relative cursor-pointer">
          <span className={`px-6 py-2.5 rounded-md font-medium transition-colors inline-block ${!exam || !year || !part ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
            {isUploading ? 'Uploading...' : 'Select File'}
          </span>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.txt,.md,.json,.docx,.doc"
            onChange={handleChange}
            disabled={isUploading || !exam || !year || !part}
          />
        </label>
        
        <button
          onClick={handleDownloadSample}
          className="px-4 py-2.5 rounded-md font-medium text-sm border border-border bg-background hover:bg-muted transition-colors flex items-center gap-2"
        >
          Download Sample Format
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
        {[
          { icon: FileType, label: 'PDF', desc: 'Scanned or Text' },
          { icon: FileType, label: 'TXT', desc: 'Plain Text' },
          { icon: FileType, label: 'MD', desc: 'Markdown' },
          { icon: FileType, label: 'JSON', desc: 'Structured Data' }
        ].map((type, i) => (
          <div key={i} className="flex flex-row items-center p-2.5 rounded-lg bg-muted/50 gap-3 border border-border/50">
            <type.icon className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex flex-col text-left">
              <span className="font-medium text-[13px] leading-tight">{type.label}</span>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">{type.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
