'use client';

import React, { useState, useRef } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, Loader2, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import mammoth from 'mammoth';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (content: any, type: 'markdown' | 'json') => void;
  contentType: 'study' | 'practice' | 'examples';
}

export function ImportModal({ isOpen, onClose, onImportComplete, contentType }: ImportModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      
      if (ext === 'md' || ext === 'txt' || ext === 'html') {
        const text = await file.text();
        onImportComplete(text, 'markdown'); // The rich text editor will parse HTML correctly
        toast.success(`${ext.toUpperCase()} file imported successfully`);
        onClose();
      } 
      else if (ext === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        onImportComplete(result.value, 'markdown'); // RichTextEditor handles HTML
        toast.success('DOCX imported successfully');
        onClose();
      }
      else if (ext === 'json') {
        let text = await file.text();
        
        // Extract JSON by finding first { or [ and last } or ]
        const firstBrace = text.indexOf('{');
        const firstBracket = text.indexOf('[');
        let start = -1;
        if (firstBrace !== -1 && firstBracket !== -1) start = Math.min(firstBrace, firstBracket);
        else start = firstBrace !== -1 ? firstBrace : firstBracket;
        
        const lastBrace = text.lastIndexOf('}');
        const lastBracket = text.lastIndexOf(']');
        let end = -1;
        if (lastBrace !== -1 && lastBracket !== -1) end = Math.max(lastBrace, lastBracket);
        else end = lastBrace !== -1 ? lastBrace : lastBracket;
        
        if (start !== -1 && end !== -1 && end >= start) {
          text = text.substring(start, end + 1);
        }

        const json = JSON.parse(text);
        
        // Ensure content is an array
        let contentArray = json;
        if (!Array.isArray(json) && json !== null && typeof json === 'object') {
          const arrayValues = Object.values(json).filter(val => Array.isArray(val));
          if (arrayValues.length > 0) {
            contentArray = arrayValues[0];
          } else {
            contentArray = [json];
          }
        }

        onImportComplete(contentArray, 'json');
        toast.success('JSON imported successfully');
        onClose();
      }
      else if (ext === 'csv') {
        const text = await file.text();
        Papa.parse(text, {
          header: true,
          complete: (results: any) => {
            onImportComplete(results.data, 'json');
            toast.success('CSV imported successfully');
            onClose();
          }
        });
      }
      else if (ext === 'xlsx') {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        onImportComplete(json, 'json');
        toast.success('Excel imported successfully');
        onClose();
      }
      else {
        toast.error('Unsupported file format. Please upload .md, .txt, .html, .docx, .json, .csv, or .xlsx');
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Content</DialogTitle>
          <DialogDescription>
            Upload a file to populate the editor. Supported formats depend on the content type.
          </DialogDescription>
        </DialogHeader>
        
        <div 
          className="mt-4 border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <p className="text-sm text-slate-500 mt-2 text-center">
            Click to select or drag and drop a file here<br/>
            {contentType === 'study' ? 'Supported: .md, .txt, .html, .docx' : 'Supported: .json, .csv, .xlsx'}
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept={contentType === 'study' ? '.md,.txt,.html,.docx' : '.json,.csv,.xlsx'}
            onChange={handleFileChange}
          />
          
          {isProcessing ? (
            <>
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
              <p className="text-sm font-medium text-slate-700">Processing file...</p>
            </>
          ) : (
            <>
              <UploadCloud className="w-10 h-10 text-slate-400 mb-4" />
              <p className="text-sm font-medium text-slate-700 mb-1">Click or drag and drop</p>
              <p className="text-xs text-slate-500 text-center">
                {contentType === 'study' ? 'MD, TXT, DOCX' : 'JSON, CSV, XLSX'}
              </p>
            </>
          )}
        </div>

        <div className="flex gap-4 mt-6 justify-center">
          <div className="flex flex-col items-center gap-1 text-slate-500">
            <FileText className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold">Documents</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-slate-500">
            <FileSpreadsheet className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold">Data Files</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
