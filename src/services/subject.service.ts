import { subjectRepository } from '@/repositories/subject.repository'
import { Subject } from '@/types/subject'

export class SubjectService {
  async getSubjects(): Promise<Subject[]> {
    return subjectRepository.getAllSubjects()
  }

  async getSubject(id: string): Promise<Subject | null> {
    return subjectRepository.getSubjectById(id)
  }
}

export const subjectService = new SubjectService()
