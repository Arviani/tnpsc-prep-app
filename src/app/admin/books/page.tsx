import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Filter, MoreHorizontal, FileEdit, Trash } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function BooksPage() {
  const supabase = await createClient()

  const { data: books } = await supabase
    .from('books')
    .select(`
      id,
      title,
      class_level,
      subject,
      questions(id)
    `)
    .order('class_level')

  const formattedBooks = books?.map(b => ({
    id: b.id,
    name: b.title,
    classLevel: b.class_level || 'N/A',
    subject: b.subject || 'Unknown',
    questionCount: b.questions?.length || 0
  })) || []

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">School Books</h1>
          <p className="text-muted-foreground mt-2">Manage Samacheer Kalvi books and link them to subjects.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Book
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-4 flex-1">
            <Input placeholder="Search books..." className="max-w-xs bg-background" />
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" /> Filter by Class
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Total: {formattedBooks.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Book Name</th>
                <th className="px-6 py-4 font-medium">Class Level</th>
                <th className="px-6 py-4 font-medium">Subject Category</th>
                <th className="px-6 py-4 font-medium text-center">Linked Questions</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {formattedBooks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No books found.</td>
                </tr>
              ) : (
                formattedBooks.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground">{b.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-600">
                        Class {b.classLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{b.subject}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                        {b.questionCount} Questions
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
