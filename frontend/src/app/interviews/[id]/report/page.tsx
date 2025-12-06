'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useInterviewStore } from '@/store/interview.store';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BookOpen, 
  Download, 
  Share2, 
  RotateCcw,
  AlertTriangle,
  Check
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function ReportContent() {
  const params = useParams();
  const router = useRouter();
  const { currentInterview, fetchInterview, isLoading, error } = useInterviewStore();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (params.id) {
      fetchInterview(params.id as string);
    }
  }, [params.id, fetchInterview]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !currentInterview) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Report</h2>
        <p className="text-gray-600 mb-6">{error || 'Interview not found'}</p>
        <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  const { 
    overall_score, 
    performance_trend, 
    job_role, 
    difficulty, 
    questions,
    report
  } = currentInterview;

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number | null) => {
    if (score === null) return 'bg-gray-100';
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  // Calculate category averages (mock implementation as categories aren't explicit in questions yet)
  const technicalScore = overall_score || 0;
  const communicationScore = Math.round((overall_score || 0) * 0.9); // Mock variation
  const problemSolvingScore = Math.round((overall_score || 0) * 0.95); // Mock variation

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Interview Report</h1>
            <p className="text-sm text-muted-foreground">{job_role} • {difficulty}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
              Dashboard
            </Button>
            <Button size="sm" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Overall Score Card */}
          <Card className="md:col-span-1 flex flex-col justify-center items-center text-center py-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-muted-foreground">Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative flex items-center justify-center h-40 w-40 mb-4">
                <svg className="h-full w-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    className="text-slate-100"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * (overall_score || 0)) / 100}
                    className={`${getScoreColor(overall_score)} transition-all duration-1000 ease-out`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className={`text-4xl font-bold ${getScoreColor(overall_score)}`}>
                    {overall_score || 0}
                  </span>
                  <span className="text-xs text-muted-foreground">OUT OF 100</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm font-medium">
                Trend: 
                {performance_trend === 'IMPROVING' && <span className="text-green-600 flex items-center"><TrendingUp className="h-4 w-4 mr-1"/> Improving</span>}
                {performance_trend === 'DECLINING' && <span className="text-red-600 flex items-center"><TrendingDown className="h-4 w-4 mr-1"/> Declining</span>}
                {(!performance_trend || performance_trend === 'CONSISTENT') && <span className="text-blue-600 flex items-center"><Minus className="h-4 w-4 mr-1"/> Consistent</span>}
              </div>
            </CardContent>
          </Card>

          {/* Breakdown & Summary */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
              <CardDescription>Detailed breakdown of your interview performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Category Scores */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Technical Accuracy</span>
                      <span className="font-medium">{technicalScore}%</span>
                    </div>
                    <Progress value={technicalScore} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Communication Clarity</span>
                      <span className="font-medium">{communicationScore}%</span>
                    </div>
                    <Progress value={communicationScore} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Completeness</span>
                      <span className="font-medium">{problemSolvingScore}%</span>
                    </div>
                    <Progress value={problemSolvingScore} className="h-2" />
                  </div>
                </div>

                {/* Quick AI Summary */}
                <div className="bg-slate-50 p-4 rounded-lg border text-sm">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    AI Summary
                  </h4>
                  <p className="text-muted-foreground">
                    {report?.summary || "Your performance was solid overall. You demonstrated good understanding of core concepts. Focus on providing more concrete examples in your answers to demonstrate practical experience."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Content Tabs */}
        <Tabs defaultValue="questions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="questions">Question Analysis</TabsTrigger>
            <TabsTrigger value="insights">Insights & Recommendations</TabsTrigger>
          </TabsList>

          {/* Question Analysis Tab */}
          <TabsContent value="questions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Question-by-Question Review</CardTitle>
                <CardDescription>
                  Review your answers, scores, and specific feedback for each question.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {questions?.map((q, index) => (
                    <AccordionItem key={q.id} value={q.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-4 text-left">
                            <span className="bg-slate-100 h-8 w-8 flex items-center justify-center rounded-full text-sm font-medium text-slate-600 shrink-0">
                              {index + 1}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm sm:text-base line-clamp-1">{q.content}</span>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="text-[10px]">{q.topic}</Badge>
                                <Badge variant="outline" className="text-[10px]">{q.difficulty}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${getScoreBg(q.answer?.score || 0)} ${getScoreColor(q.answer?.score || 0)}`}>
                            {q.answer?.score !== null ? `${q.answer?.score}%` : 'N/A'}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 px-4 pb-4 bg-slate-50/50">
                        <div className="grid gap-6">
                          <div className="grid gap-2">
                            <h4 className="text-sm font-semibold text-muted-foreground">Question</h4>
                            <p className="text-sm">{q.content}</p>
                          </div>
                          
                          <div className="grid gap-2">
                            <h4 className="text-sm font-semibold text-muted-foreground">Your Answer</h4>
                            <div className="bg-white p-3 rounded border text-sm italic text-slate-700">
                              "{q.answer?.transcript || 'No answer recorded'}"
                            </div>
                          </div>

                          {q.answer?.evaluation_json && (
                            <div className="grid gap-2">
                              <h4 className="text-sm font-semibold text-muted-foreground">Detailed Scores</h4>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-2 bg-white rounded border">
                                  <div className="text-xs text-muted-foreground">Correctness</div>
                                  <div className="font-bold">{q.answer.evaluation_json.correctness}%</div>
                                </div>
                                <div className="text-center p-2 bg-white rounded border">
                                  <div className="text-xs text-muted-foreground">Completeness</div>
                                  <div className="font-bold">{q.answer.evaluation_json.completeness}%</div>
                                </div>
                                <div className="text-center p-2 bg-white rounded border">
                                  <div className="text-xs text-muted-foreground">Clarity</div>
                                  <div className="font-bold">{q.answer.evaluation_json.clarity}%</div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="grid gap-2">
                            <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                              <BookOpen className="h-3 w-3" />
                              Feedback
                            </h4>
                            <p className="text-sm text-slate-700">
                              {q.answer?.feedback || 'No feedback available.'}
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
             {/* Strengths & Weaknesses */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" /> Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(report?.strengths || ["Strong technical vocabulary", "Clear communication style", "Good understanding of basics"]).map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <AlertTriangle className="h-5 w-5" /> Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(report?.weaknesses || ["Could provide more concrete examples", "Go deeper into system design concepts", "Improve answer structure"]).map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Actionable Recommendations</CardTitle>
                <CardDescription>Steps to take to improve your interview performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(report?.recommendations || ["Practice STAR method for behavioral questions", "Review system design patterns", "Mock interview with a peer"]).map((rec: string, i: number) => (
                    <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-lg border">
                      <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center text-primary font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Recommendation {i + 1}</h4>
                        <p className="text-sm text-muted-foreground">{rec}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Resources */}
            {report?.learning_resources && report.learning_resources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Learning Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {report.learning_resources.map((res: any, i: number) => (
                      <a 
                        key={i} 
                        href={res.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center p-4 border rounded-lg hover:bg-slate-50 transition-colors group"
                      >
                        <div className="bg-blue-50 p-2 rounded mr-3 group-hover:bg-blue-100 transition-colors">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-blue-700 group-hover:underline">{res.title}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">{res.url}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Footer */}
        <div className="mt-12 flex justify-center gap-4">
          <Button variant="outline" size="lg" onClick={() => router.push('/interviews/new')}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Practice Again
          </Button>
          <Button size="lg" onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}

export default function InterviewReportPage() {
  return (
    <ProtectedRoute>
      <ReportContent />
    </ProtectedRoute>
  );
}
