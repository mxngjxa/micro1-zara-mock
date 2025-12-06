'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useInterviewStore } from '@/store/interview.store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export default function InterviewsListPage() {
  const router = useRouter();
  const { interviews, fetchUserInterviews, isLoading } = useInterviewStore();
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    // In a real app, we'd pass the status filter to the API
    fetchUserInterviews();
  }, [fetchUserInterviews]);

  const filteredInterviews = interviews.filter(interview => {
    if (activeTab === 'ALL') return true;
    return interview.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'default'; // dark/black
      case 'IN_PROGRESS': return 'secondary'; // gray
      case 'PENDING': return 'outline'; // white/outline
      default: return 'destructive';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'JUNIOR': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'MID': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'SENIOR': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default: return '';
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Interviews</h1>
          <p className="text-muted-foreground">Manage and track your interview sessions</p>
        </div>
        <Button onClick={() => router.push('/interviews/new')}>
          + New Interview
        </Button>
      </div>

      <Tabs defaultValue="ALL" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-[600px]">
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="IN_PROGRESS">In Progress</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse h-[250px] bg-muted/20" />
              ))}
            </div>
          ) : filteredInterviews.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed">
              <h3 className="text-lg font-medium">No interviews found</h3>
              <p className="text-muted-foreground mb-4">You haven't created any interviews in this category yet.</p>
              <Button variant="outline" onClick={() => router.push('/interviews/new')}>
                Create Your First Interview
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInterviews.map((interview) => (
                <Card key={interview.id} className="flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Badge className={getDifficultyColor(interview.difficulty)} variant="outline">
                        {interview.difficulty}
                      </Badge>
                      <Badge variant={getStatusColor(interview.status) as any}>
                        {interview.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mt-2 truncate" title={interview.job_role}>
                      {interview.job_role}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Created on {new Date(interview.started_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{interview.completed_questions} / {interview.total_questions}</span>
                      </div>
                      <Progress 
                        value={(interview.completed_questions / interview.total_questions) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {interview.topics.slice(0, 3).map(topic => (
                        <span key={topic} className="text-[10px] px-2 py-1 bg-secondary rounded-full">
                          {topic}
                        </span>
                      ))}
                      {interview.topics.length > 3 && (
                        <span className="text-[10px] px-2 py-1 bg-secondary rounded-full">
                          +{interview.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    {interview.status === 'PENDING' && (
                      <Button className="w-full" onClick={() => router.push(`/interviews/${interview.id}/session`)}>
                        Start Interview
                      </Button>
                    )}
                    {interview.status === 'IN_PROGRESS' && (
                      <Button className="w-full" variant="secondary" onClick={() => router.push(`/interviews/${interview.id}/session`)}>
                        Continue Session
                      </Button>
                    )}
                    {interview.status === 'COMPLETED' && (
                      <Button className="w-full" variant="outline" onClick={() => router.push(`/interviews/${interview.id}/report`)}>
                        View Report
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
