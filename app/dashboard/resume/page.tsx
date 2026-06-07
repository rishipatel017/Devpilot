'use client';

import { useState } from 'react';
import ToolShell from '@/components/tool-shell';
import ResponseCard from '@/components/response-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactMarkdown from 'react-markdown';

export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResponse('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, focusArea }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to analyze resume');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let fullText = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value);
          fullText += text;
          setResponse(fullText);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolShell
      title="Resume Analyzer"
      description="Get AI-powered feedback on your resume with actionable improvement suggestions"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="resume" className="text-gray-300 font-semibold">Resume Text</Label>
          <Textarea
            id="resume"
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={12}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:bg-white/10 backdrop-blur-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="focusArea" className="text-gray-300 font-semibold">Focus Area (Optional)</Label>
          <Select value={focusArea} onValueChange={setFocusArea}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white focus:bg-white/10 backdrop-blur-sm">
              <SelectValue placeholder="Select a target role" />
            </SelectTrigger>
            <SelectContent className="bg-white/5 border-white/10 backdrop-blur-sm">
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="frontend">Frontend Developer</SelectItem>
              <SelectItem value="backend">Backend Developer</SelectItem>
              <SelectItem value="fullstack">Full Stack Developer</SelectItem>
              <SelectItem value="devops">DevOps Engineer</SelectItem>
              <SelectItem value="data">Data Scientist</SelectItem>
              <SelectItem value="mobile">Mobile Developer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="text-sm text-red-300 bg-red-500/20 border border-red-500/30 p-3 rounded-md backdrop-blur-sm">
            {error}
          </div>
        )}

        <Button type="submit" disabled={isLoading || !resumeText} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-500/30">
          {isLoading ? 'Analyzing...' : 'Analyze Resume'}
        </Button>
      </form>

      {response && (
        <ResponseCard isLoading={isLoading}>
          <ReactMarkdown>{response}</ReactMarkdown>
        </ResponseCard>
      )}
    </ToolShell>
  );
}
