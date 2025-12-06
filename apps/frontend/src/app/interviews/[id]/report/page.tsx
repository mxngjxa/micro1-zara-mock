'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useInterviewStore } from '@/store/interview.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function InterviewReportPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { currentInterview, fetchInterview, isLoading } = useInterviewStore();

  useEffect(() => {
    if (id) {
      fetchInterview(id);
    }
  }, [id, fetchInterview]);

  if (isLoading || !currentInterview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const overallScore = currentInterview.overall_score || 0;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">Interview Complete! 🎉</h1>
        <p className="text-muted-foreground">Here's a summary of your session for {currentInterview.job_role}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore > 0 ? `${overallScore}%` : 'N/A'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Questions Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {currentInterview.completed_questions} <span className="text-xl text-muted-foreground font-normal">/ {currentInterview.total_questions}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {currentInterview.duration_minutes || 0} <span className="text-xl text-muted-foreground font-normal">min</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Questions Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {currentInterview.questions?.map((question, index) => (
              <div key={question.id}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center p-0">
                        {index + 1}
                      </Badge>
                      <h4 className="font-medium text-lg">{question.content}</h4>
                    </div>
                    {question.answer?.transcript && (
                      <p className="text-sm text-muted-foreground pl-8 line-clamp-2">
                        {question.answer.transcript}
                      </p>
                    )}
                  </div>
                  
                  {question.answer?.score !== undefined && question.answer.score !== null && (
                    <div className="flex items-center gap-3 pl-8 md:pl-0">
                      <Progress value={question.answer.score} className="w-24 h-2" />
                      <span className={`font-bold ${getScoreColor(question.answer.score)}`}>
                        {question.answer.score}%
                      </span>
                    </div>
                  )}
                </div>
                {index < (currentInterview.questions?.length || 0) - 1 && <Separator className="my-4" />}
              </div>
            ))}

            {(!currentInterview.questions || currentInterview.questions.length === 0) && (
              <p className="text-center text-muted-foreground py-4">No questions recorded for this session.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
        <Button onClick={() => router.push('/interviews/new')}>
          Start New Interview
        </Button>
        <Button variant="secondary" disabled title="Coming in Phase 3">
          View Detailed Report 🔒
        </Button>
      </div>

      <Alert className="mt-8 bg-blue-50 border-blue-200">
        <AlertTitle>Phase 3 Preview</AlertTitle>
        <AlertDescription className="text-blue-800">
          Detailed AI insights, performance trends, and improvement recommendations will be available in the next update.
        </AlertDescription>
      </Alert>
    </div>
  );
}
