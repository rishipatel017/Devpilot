'use client';

import { useState } from 'react';
import ToolShell from '@/components/tool-shell';
import ResponseCard from '@/components/response-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactMarkdown from 'react-markdown';

export default function SQLHelperPage() {
  const [request, setRequest] = useState('');
  const [schema, setSchema] = useState('');
  const [dialect, setDialect] = useState('PostgreSQL');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResponse('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request, schema, dialect }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate SQL');
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
      title="SQL Helper"
      description="Convert natural language to optimized SQL queries with explanations"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="request" className="text-gray-300 font-semibold">Natural Language Request</Label>
          <Textarea
            id="request"
            placeholder="Describe what data you want to query in plain English..."
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            rows={4}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:bg-white/10 backdrop-blur-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="schema" className="text-gray-300 font-semibold">Database Schema (Optional)</Label>
          <Textarea
            id="schema"
            placeholder="Paste your table schema here..."
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            rows={6}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:bg-white/10 backdrop-blur-sm font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dialect" className="text-gray-300 font-semibold">SQL Dialect</Label>
          <Select value={dialect} onValueChange={setDialect}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white focus:bg-white/10 backdrop-blur-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white/5 border-white/10 backdrop-blur-sm">
              <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
              <SelectItem value="MySQL">MySQL</SelectItem>
              <SelectItem value="SQLite">SQLite</SelectItem>
              <SelectItem value="SQL Server">SQL Server</SelectItem>
              <SelectItem value="Oracle">Oracle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="text-sm text-red-300 bg-red-500/20 border border-red-500/30 p-3 rounded-md backdrop-blur-sm">
            {error}
          </div>
        )}

        <Button type="submit" disabled={isLoading || !request} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-500/30">
          {isLoading ? 'Generating...' : 'Generate SQL'}
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
