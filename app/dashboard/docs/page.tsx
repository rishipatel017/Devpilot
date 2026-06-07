'use client';

import { useState } from 'react';
import ToolShell from '@/components/tool-shell';
import ResponseCard from '@/components/response-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactMarkdown from 'react-markdown';

export default function DocumentationPage() {
  const [code, setCode] = useState('');
  const [style, setStyle] = useState('JSDoc');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResponse('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, style }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate documentation');
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
      title="Documentation Writer"
      description="Generate professional documentation for your code automatically"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="code" className="text-gray-300 font-semibold">Code</Label>
          <Textarea
            id="code"
            placeholder="Paste your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={12}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:bg-white/10 backdrop-blur-sm font-mono text-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="style" className="text-gray-300 font-semibold">Documentation Style</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white focus:bg-white/10 backdrop-blur-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white/5 border-white/10 backdrop-blur-sm">
              <SelectItem value="JSDoc">JSDoc</SelectItem>
              <SelectItem value="TSDoc">TSDoc</SelectItem>
              <SelectItem value="Python Docstring">Python Docstring</SelectItem>
              <SelectItem value="JavaDoc">JavaDoc</SelectItem>
              <SelectItem value="GoDoc">GoDoc</SelectItem>
              <SelectItem value="RustDoc">RustDoc</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="text-sm text-red-300 bg-red-500/20 border border-red-500/30 p-3 rounded-md backdrop-blur-sm">
            {error}
          </div>
        )}

        <Button type="submit" disabled={isLoading || !code} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-500/30">
          {isLoading ? 'Generating...' : 'Generate Documentation'}
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
