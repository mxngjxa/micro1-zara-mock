import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Question } from '../database/entities/question.entity';
import { Answer } from '../database/entities/answer.entity';
import { CreateAnswerDto } from '../answers/dto/create-answer.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
  ) {}

  async getNextQuestion(interviewId: string): Promise<Question | null> {
    // Get all questions for the interview ordered by sequence
    const questions = await this.questionRepository.find({
      where: { interview_id: interviewId },
      order: { order: 'ASC' },
    });

    if (!questions.length) {
      return null;
    }

    // Get all answers for the interview
    const answers = await this.answerRepository.find({
      where: {
        question: { interview_id: interviewId },
      },
      relations: ['question'],
    });

    const answeredQuestionIds = new Set(answers.map((a) => a.question_id));
    
    // Filter to get unanswered questions
    const unansweredQuestions = questions.filter(
      (q) => !answeredQuestionIds.has(q.id)
    );

    if (unansweredQuestions.length === 0) {
      return null; // All questions answered
    }

    // If no answers yet, return first question
    if (answers.length === 0) {
      return unansweredQuestions[0];
    }

    // Get last answer's score for adaptive difficulty
    // Sort answers by creation time to find the last one
    answers.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    const lastAnswer = answers[0];
    const lastScore = lastAnswer.score || 0;

    let preferredDifficulty: 'EASY' | 'MEDIUM' | 'HARD';

    // Simple adaptive logic
    if (lastScore >= 80) {
      preferredDifficulty = 'HARD';
    } else if (lastScore >= 50) {
      preferredDifficulty = 'MEDIUM';
    } else {
      preferredDifficulty = 'EASY';
    }

    // Find next unanswered question matching preferred difficulty
    const nextQuestion = unansweredQuestions.find(
      (q) => q.difficulty === preferredDifficulty
    );

    // If no match found, return the next available question regardless of difficulty
    return nextQuestion || unansweredQuestions[0];
  }

  async getQuestionById(questionId: string): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    return question;
  }

  // Used internally by InterviewsService
  async bulkCreateQuestions(
    interviewId: string,
    questionsData: Array<{
      content: string;
      expected_answer: string;
      difficulty: 'EASY' | 'MEDIUM' | 'HARD';
      topic: string;
      order: number;
    }>
  ): Promise<Question[]> {
    const questions = questionsData.map((data) => {
      const question = this.questionRepository.create({
        interview_id: interviewId,
        content: data.content,
        expected_answer: data.expected_answer,
        difficulty: data.difficulty,
        topic: data.topic,
        order: data.order,
      });
      return question;
    });

    return await this.questionRepository.save(questions);
  }
}
