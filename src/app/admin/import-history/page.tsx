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
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import History</h1>
          <p className="text-muted-foreground mt-2">Audit log of all PDF parsing and database import operations.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-4 flex-1">
            <Input placeholder="Search filenames..." className="max-w-xs bg-background" />
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" /> Filter Status
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Total Imports: 124
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">File Name</th>
                <th className="px-6 py-4 font-medium text-center">Imported</th>
                <th className="px-6 py-4 font-medium text-center">Duplicates</th>
                <th className="px-6 py-4 font-medium text-center">Errors</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockHistory.map((h) => (
                <tr key={h.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{h.date}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{h.filename}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-foreground">{h.questions}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-orange-500 font-medium">
                    {h.duplicates > 0 ? h.duplicates : '-'}
                  </td>
                  <td className="px-6 py-4 text-center text-red-500 font-medium">
                    {h.errors > 0 ? h.errors : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {h.status === 'success' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-600">
                        <CheckCircle className="w-3.5 h-3.5" /> Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-600">
                        <AlertTriangle className="w-3.5 h-3.5" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 text-muted-foreground">
                      <button className="p-1 hover:text-primary transition-colors"><Eye className="w-4 h-4" /></button>
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
