import { chapterRepository } from '@/repositories/chapter.repository'
import { Chapter } from '@/types/chapter'

export class ChapterService {
  async getChaptersBySubject(subjectId: string): Promise<Chapter[]> {
    return chapterRepository.getChaptersBySubject(subjectId)
  }

  async getChapter(chapterId: string): Promise<Chapter | null> {
    return chapterRepository.getChapterById(chapterId)
  }
}

export const chapterService = new ChapterService()
