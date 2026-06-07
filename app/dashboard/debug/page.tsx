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

export default function BugFixerPage() {
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setResponse('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error, code, language }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to debug code');
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
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ToolShell
      title="Bug Fixer"
      description="Debug your code with AI-powered error analysis and solutions"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="error" className="text-gray-300 font-semibold">Error Message / Stack Trace</Label>
          <Textarea
            id="error"
            placeholder="Paste the error message or stack trace here..."
            value={error}
            onChange={(e) => setError(e.target.value)}
            rows={6}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:bg-white/10 backdrop-blur-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code" className="text-gray-300 font-semibold">Code Context (Optional)</Label>
          <Textarea
            id="code"
            placeholder="Paste the relevant code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={8}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:bg-white/10 backdrop-blur-sm font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language" className="text-gray-300 font-semibold">Programming Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white focus:bg-white/10 backdrop-blur-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white/5 border-white/10 backdrop-blur-sm">
              <SelectItem value="JavaScript">JavaScript</SelectItem>
              <SelectItem value="TypeScript">TypeScript</SelectItem>
              <SelectItem value="Python">Python</SelectItem>
              <SelectItem value="Java">Java</SelectItem>
              <SelectItem value="C#">C#</SelectItem>
              <SelectItem value="Go">Go</SelectItem>
              <SelectItem value="Rust">Rust</SelectItem>
              <SelectItem value="Ruby">Ruby</SelectItem>
              <SelectItem value="PHP">PHP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {errorMsg && (
          <div className="text-sm text-red-300 bg-red-500/20 border border-red-500/30 p-3 rounded-md backdrop-blur-sm">
            {errorMsg}
          </div>
        )}

        <Button type="submit" disabled={isLoading || !error} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-500/30">
          {isLoading ? 'Debugging...' : 'Debug Code'}
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
