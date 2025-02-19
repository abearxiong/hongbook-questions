import { z } from 'zod';

export const questionSchema = z.object({
  id: z.string(),
  question: z.string().default(''),
  answer: z.string().default(''),
  showInReview: z.boolean().default(true)
});

export type Question = z.infer<typeof questionSchema>;

export const questionValidation = (question: Partial<Question>) => {
  const result = questionSchema.safeParse(question);
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message
    }));
    return { isValid: false, errors };
  }
  return { isValid: true, errors: [] };
};

export const filterQuestions = (questions: Question[], searchTerm: string) => {
  const term = searchTerm.toLowerCase().trim();
  return questions.filter(q => 
    q.question.toLowerCase().includes(term) || 
    q.answer.toString().toLowerCase().includes(term)
  );
};