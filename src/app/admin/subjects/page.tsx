import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, MoreHorizontal, FileEdit, Trash } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function SubjectsPage() {
  const supabase = await createClient()

  const { data: subjects, error } = await supabase
    .from('subjects')
    .select(`
      id, 
      name, 
      description,
      chapters (id),
      questions (id)
    `)
    .order('name')

  const formattedSubjects = subjects?.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description || 'No description provided.',
    chapterCount: s.chapters?.length || 0,
    questionCount: s.questions?.length || 0
  })) || []

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground mt-2">Manage the root level categorization of your content.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Subject
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-4 flex-1">
            <Input placeholder="Search subjects..." className="max-w-xs bg-background" />
          </div>
          <div className="text-sm text-muted-foreground">
            Total: {formattedSubjects.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Subject Name</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium text-center">Chapters</th>
                <th className="px-6 py-4 font-medium text-center">Questions</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {formattedSubjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No subjects found.</td>
                </tr>
              ) : (
                formattedSubjects.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground">{s.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{s.description}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-500">
                        {s.chapterCount} Chapters
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-500/10 text-purple-500">
                        {s.questionCount} Questions
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
