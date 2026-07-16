import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Filter, Eye, AlertTriangle, CheckCircle } from 'lucide-react'

// Mock Data
const mockHistory = [
  { id: '1', date: '2023-10-25 14:30', filename: 'Group4_2022_Tamil.pdf', questions: 100, duplicates: 0, errors: 0, duration: '45s', status: 'success' },
  { id: '2', date: '2023-10-24 09:15', filename: 'Group2_2021_GS.pdf', questions: 72, duplicates: 3, errors: 0, duration: '38s', status: 'success' },
  { id: '3', date: '2023-10-20 16:45', filename: 'Group4_2019_Math.pdf', questions: 15, duplicates: 0, errors: 10, duration: '12s', status: 'failed' },
]

export default function ImportHistoryPage() {
  return (
    <div className="p-4 md:p-6 w-full max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Import History</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Audit log of all PDF parsing and database import operations.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-md shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-3 border-b border-border flex items-center justify-between bg-surface-muted">
          <div className="flex items-center gap-3 flex-1">
            <Input placeholder="Search filenames..." className="max-w-xs bg-background h-8 text-[13px]" />
            <Button variant="outline" className="gap-2 h-8 text-[12px] px-3">
              <Filter className="w-3.5 h-3.5" /> Filter Status
            </Button>
          </div>
          <div className="text-[12px] font-medium text-muted-foreground">
            Total Imports: 124
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left">
            <thead className="text-[11px] font-semibold text-muted-foreground uppercase bg-surface-muted border-b border-border">
              <tr>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">File Name</th>
                <th className="px-3 py-2.5 text-center">Imported</th>
                <th className="px-3 py-2.5 text-center">Duplicates</th>
                <th className="px-3 py-2.5 text-center">Errors</th>
                <th className="px-3 py-2.5 text-center">Status</th>
                <th className="px-3 py-2.5 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockHistory.map((h) => (
                <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{h.date}</td>
                  <td className="px-3 py-2.5 font-medium text-foreground">{h.filename}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="font-bold text-foreground">{h.questions}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center text-orange-500 font-medium">
                    {h.duplicates > 0 ? h.duplicates : '-'}
                  </td>
                  <td className="px-3 py-2.5 text-center text-red-500 font-medium">
                    {h.errors > 0 ? h.errors : '-'}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {h.status === 'success' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[11px] font-medium bg-green-500/10 text-green-600">
                        <CheckCircle className="w-3 h-3" /> Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[11px] font-medium bg-red-500/10 text-red-600">
                        <AlertTriangle className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex justify-end gap-1.5 text-muted-foreground">
                      <button className="p-1 hover:text-primary transition-colors bg-surface-muted rounded border border-transparent hover:border-border"><Eye className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
