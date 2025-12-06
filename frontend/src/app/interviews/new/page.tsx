'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInterviewStore } from '@/store/interview.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  job_role: z.string().min(2, 'Job role must be at least 2 characters').max(100, 'Job role must be less than 100 characters'),
  difficulty: z.enum(['JUNIOR', 'MID', 'SENIOR']),
  topics: z.array(z.string()).min(1, 'Select at least one topic'),
  total_questions: z.number().min(5).max(20),
});

type FormData = z.infer<typeof formSchema>;

const COMMON_TOPICS = [
  'JavaScript', 'React', 'Node.js', 'TypeScript', 'System Design',
  'Algorithms', 'Data Structures', 'Databases', 'APIs'
];

export default function InterviewSetupPage() {
  const router = useRouter();
  const { createInterview, isLoading, error } = useInterviewStore();
  const [customTopic, setCustomTopic] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      job_role: '',
      difficulty: 'MID',
      topics: [],
      total_questions: 10,
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;
  const selectedTopics = watch('topics');
  const questionCount = watch('total_questions');

  const onSubmit = async (data: FormData) => {
    try {
      const interview = await createInterview(data);
      router.push(`/interviews/${interview.id}/session`);
    } catch (err) {
      // Error handled by store
    }
  };

  const toggleTopic = (topic: string) => {
    const currentTopics = selectedTopics || [];
    if (currentTopics.includes(topic)) {
      setValue('topics', currentTopics.filter(t => t !== topic));
    } else {
      setValue('topics', [...currentTopics, topic]);
    }
  };

  const addCustomTopic = () => {
    if (customTopic && !selectedTopics.includes(customTopic)) {
      setValue('topics', [...selectedTopics, customTopic]);
      setCustomTopic('');
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">New Interview Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="job_role">Target Job Role</Label>
                <Input
                  id="job_role"
                  placeholder="e.g. Senior Frontend Engineer"
                  {...register('job_role')}
                  className="mt-2"
                />
                {errors.job_role && (
                  <p className="text-sm text-red-500 mt-1">{errors.job_role.message}</p>
                )}
              </div>

              <div>
                <Label>Difficulty Level</Label>
                <RadioGroup
                  defaultValue="MID"
                  onValueChange={(val) => setValue('difficulty', val as any)}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="JUNIOR" id="junior" />
                    <Label htmlFor="junior">Junior</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MID" id="mid" />
                    <Label htmlFor="mid">Mid-Level</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="SENIOR" id="senior" />
                    <Label htmlFor="senior">Senior</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-2 block">Topics</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {COMMON_TOPICS.map((topic) => (
                    <div key={topic} className="flex items-center space-x-2">
                      <Checkbox
                        id={topic}
                        checked={selectedTopics?.includes(topic)}
                        onCheckedChange={() => toggleTopic(topic)}
                      />
                      <Label htmlFor={topic} className="text-sm font-normal">
                        {topic}
                      </Label>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom topic"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTopic())}
                  />
                  <Button type="button" variant="outline" onClick={addCustomTopic}>
                    Add
                  </Button>
                </div>
                
                {selectedTopics?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedTopics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="px-3 py-1">
                        {topic}
                        <button
                          type="button"
                          onClick={() => toggleTopic(topic)}
                          className="ml-2 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {errors.topics && (
                  <p className="text-sm text-red-500 mt-1">{errors.topics.message}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label>Number of Questions</Label>
                  <span className="text-sm text-muted-foreground">{questionCount} Questions</span>
                </div>
                <Slider
                  min={5}
                  max={20}
                  step={1}
                  value={[questionCount]}
                  onValueChange={(val) => setValue('total_questions', val[0])}
                  className="py-4"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Estimated duration: ~{questionCount * 2} minutes
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating Interview...' : 'Start Interview'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
