'use client'

import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Option } from '@/types/question'

interface OptionCardProps {
  option: Option
  isSelected: boolean
  isSubmitted: boolean
  onSelect: (id: string) => void
}

export function OptionCard({ option, isSelected, isSubmitted, onSelect }: OptionCardProps) {
  const isOptionCorrect = option.is_correct
  
  let optionStyles = "border-border hover:bg-secondary cursor-pointer"
  let indicator = null

  if (isSubmitted) {
    if (isOptionCorrect) {
      // Always highlight correct option
      optionStyles = "border-success bg-success/10 cursor-default"
      indicator = <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
    } else if (isSelected && !isOptionCorrect) {
      // Highlight selected wrong option
      optionStyles = "border-destructive bg-destructive/10 cursor-default"
      indicator = <XCircle className="w-5 h-5 text-destructive shrink-0" />
    } else {
      // Dim other unselected options
      optionStyles = "border-border opacity-50 cursor-default"
    }
  } else if (isSelected) {
    optionStyles = "border-primary bg-primary/5 cursor-pointer ring-1 ring-primary"
  }

  return (
    <label 
      onClick={() => {
        if (!isSubmitted) {
          onSelect(option.id)
        }
      }}
      className={cn(
        "flex items-start md:items-center gap-4 p-4 border rounded-lg transition-all",
        optionStyles
      )}
    >
      {!isSubmitted && (
        <div className="pt-0.5 md:pt-0 shrink-0">
          <div className={cn(
            "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
            isSelected ? "border-primary bg-primary" : "border-muted-foreground bg-background"
          )}>
            {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
          </div>
        </div>
      )}
      {indicator && <div className="pt-0.5 md:pt-0">{indicator}</div>}
      
      <div className="flex-1 flex gap-3">
        <span className="font-bold text-muted-foreground w-6 shrink-0">{option.label}.</span>
        <span className="font-medium text-foreground text-base md:text-lg">{option.body}</span>
      </div>
    </label>
  )
}
