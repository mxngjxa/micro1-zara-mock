'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface QuestionDisplayProps {
  question: string;
  questionNumber: number;
  totalQuestions: number;
}

export function QuestionDisplay({ question, questionNumber, totalQuestions }: QuestionDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      key={question} // Re-animate when question changes
      className="w-full max-w-2xl mx-auto mt-8"
    >
      <Card className="bg-background/80 backdrop-blur border-primary/20 shadow-lg">
        <CardContent className="p-6 text-center">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">
            Question {questionNumber} of {totalQuestions}
          </span>
          <h2 className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">
            {question}
          </h2>
        </CardContent>
      </Card>
    </motion.div>
  );
}
