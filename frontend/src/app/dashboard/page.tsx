'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, TrendingUp, CheckCircle, Clock, Plus, Play, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useInterviewStore } from '@/store/interview.store';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

/**
 * Renders the authenticated user's dashboard UI with header, stats, welcome card, and recent activity.
 */
function DashboardContent() {
  const { user, logout } = useAuthStore();
  const { interviews, fetchUserInterviews, isLoading } = useInterviewStore();
  const router = useRouter();

  useEffect(() => {
    fetchUserInterviews({ limit: 5 });
  }, [fetchUserInterviews]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Calculate stats
  const totalInterviews = interviews.length;
  const completedInterviews = interviews.filter(i => i.status === 'COMPLETED').length;
  const scoredInterviews = interviews.filter(i => i.status === 'COMPLETED' && i.overall_score);
  const averageScore = completedInterviews > 0
    ? Math.round(scoredInterviews.reduce((acc, curr) => acc + (curr.overall_score || 0), 0) / (scoredInterviews.length || 1))
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Interview Dashboard</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome back! 👋</CardTitle>
              <CardDescription>
                Ready to take your interview skills to the next level?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="gap-2 w-full sm:w-auto" onClick={() => router.push('/interviews/new')}>
                <Plus className="h-5 w-5" />
                Start New Interview
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Shortcuts to your most important tasks</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => router.push('/interviews')}>
                View All Interviews
              </Button>
              <Button variant="outline" className="flex-1" disabled title="Coming Phase 3">
                Practice Questions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalInterviews}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {interviews.filter(i => i.status === 'PENDING').length} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{averageScore > 0 ? `${averageScore}%` : '-'}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on completed sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedInterviews}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Successfully finished
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest interview sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted/20 animate-pulse rounded-md" />)}
              </div>
            ) : interviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-slate-100 p-4 mb-4">
                  <Clock className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No interviews yet</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  Start your first AI interview to practice your skills and get personalized feedback
                </p>
                <Button variant="outline" onClick={() => router.push('/interviews/new')}>
                  Create Interview
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {interviews.slice(0, 5).map(interview => (
                  <div key={interview.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        interview.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                        interview.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {interview.status === 'COMPLETED' ? <CheckCircle className="h-5 w-5" /> :
                         interview.status === 'IN_PROGRESS' ? <Play className="h-5 w-5" /> :
                         <Clock className="h-5 w-5" />}
                      </div>
                      <div>
                        <h4 className="font-medium">{interview.job_role}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                            {interview.difficulty}
                          </Badge>
                          <span>•</span>
                          <span>{new Date(interview.started_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {interview.status === 'COMPLETED' && interview.overall_score && (
                        <div className="text-right hidden sm:block">
                          <span className="text-sm font-bold block">{interview.overall_score}%</span>
                          <span className="text-xs text-muted-foreground">Score</span>
                        </div>
                      )}
                      
                      {interview.status === 'IN_PROGRESS' && (
                         <div className="w-24 hidden sm:block">
                           <div className="flex justify-between text-xs mb-1">
                             <span>Progress</span>
                             <span>{Math.round((interview.completed_questions / interview.total_questions) * 100)}%</span>
                           </div>
                           <Progress value={(interview.completed_questions / interview.total_questions) * 100} className="h-1" />
                         </div>
                      )}
                      
                      <Button size="sm" variant="ghost" onClick={() => {
                        if (interview.status === 'COMPLETED') router.push(`/interviews/${interview.id}/report`);
                        else router.push(`/interviews/${interview.id}/session`);
                      }}>
                        {interview.status === 'COMPLETED' ? 'View Report' : 'Continue'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {interviews.length > 5 && (
            <CardFooter>
              <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => router.push('/interviews')}>
                View All History
              </Button>
            </CardFooter>
          )}
        </Card>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
