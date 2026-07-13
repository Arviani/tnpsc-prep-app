import React from 'react'
import Link from 'next/link'
import { UploadCloud, HelpCircle, BookOpen, Layers, BookMarked, History } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const dashboardCards = [
  {
    title: 'Import Question Paper',
    description: 'Upload TNPSC scanned PDFs and import them into the database.',
    href: '/admin/import',
    icon: UploadCloud,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  {
    title: 'Manage Questions',
    description: 'View, edit, filter, and validate all extracted questions.',
    href: '/admin/questions',
    icon: HelpCircle,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10'
  },
  {
    title: 'Subjects',
    description: 'Manage root subjects like General Studies, Tamil, etc.',
    href: '/admin/subjects',
    icon: BookOpen,
    color: 'text-green-500',
    bg: 'bg-green-500/10'
  },
  {
    title: 'Chapters',
    description: 'Organize subjects into specific chapters and topics.',
    href: '/admin/chapters',
    icon: Layers,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10'
  },
  {
    title: 'School Books',
    description: 'Link questions to state board syllabus books.',
    href: '/admin/books',
    icon: BookMarked,
    color: 'text-pink-500',
    bg: 'bg-pink-500/10'
  },
  {
    title: 'Import History',
    description: 'Review logs of all past PDF imports and their status.',
    href: '/admin/import-history',
    icon: History,
    color: 'text-gray-500',
    bg: 'bg-gray-500/10'
  }
]

export default function AdminDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage all TNPSC preparation content from a central workspace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card) => (
          <Link key={card.title} href={card.href} className="group block h-full">
            <Card className="h-full hover:shadow-md transition-all border-border hover:border-primary/50 bg-card cursor-pointer">
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.bg}`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
