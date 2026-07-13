import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Filter, MoreHorizontal, FileEdit, Trash } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function ChaptersPage() {
  const supabase = await createClient()

  const { data: chapters } = await supabase
    .from('chapters')
    .select(`
      id,
      title,
      subjects(name),
      questions(id)
    `)
    .order('title')

  const formattedChapters = chapters?.map(c => ({
    id: c.id,
    name: c.title,
    subject: (c.subjects as any)?.name || 'Unknown',
    questionCount: c.questions?.length || 0
  })) || []

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chapters</h1>
          <p className="text-muted-foreground mt-2">Break down subjects into chapters and organize questions.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Chapter
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-4 flex-1">
            <Input placeholder="Search chapters..." className="max-w-xs bg-background" />
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" /> Filter by Subject
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Total: {formattedChapters.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Chapter Name</th>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium text-center">Questions</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {formattedChapters.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No chapters found.</td>
                </tr>
              ) : (
                formattedChapters.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground">{c.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{c.subject}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-500/10 text-purple-500">
                        {c.questionCount} Questions
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 text-muted-foreground">
                        <button className="p-1 hover:text-primary transition-colors"><FileEdit className="w-4 h-4" /></button>
                        <button className="p-1 hover:text-destructive transition-colors"><Trash className="w-4 h-4" /></button>
                        <button className="p-1 hover:text-foreground transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
