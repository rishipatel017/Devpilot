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

export default function GitHubExplainerPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('intermediate');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResponse('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, description, level }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to explain repository');
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
      title="GitHub Explainer"
      description="Understand any GitHub repository with AI-generated architecture overviews"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="repoUrl" className="text-gray-300 font-semibold">Repository URL</Label>
          <Input
            id="repoUrl"
            type="url"
            placeholder="https://github.com/username/repository"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:bg-white/10 backdrop-blur-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-gray-300 font-semibold">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Add any context about the repository..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:bg-white/10 backdrop-blur-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="level" className="text-gray-300 font-semibold">Comprehension Level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white focus:bg-white/10 backdrop-blur-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white/5 border-white/10 backdrop-blur-sm">
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="text-sm text-red-300 bg-red-500/20 border border-red-500/30 p-3 rounded-md backdrop-blur-sm">
            {error}
          </div>
        )}

        <Button type="submit" disabled={isLoading || !repoUrl} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-500/30">
          {isLoading ? 'Explaining...' : 'Explain Repository'}
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
