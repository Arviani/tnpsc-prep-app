import { questionRepository } from '@/repositories/question.repository'
import { Question } from '@/types/question'

export class QuestionService {
  async getQuestionsByChapter(chapterId: string): Promise<Question[]> {
    return questionRepository.getQuestionsByChapter(chapterId)
  }
}

export const questionService = new QuestionService()
