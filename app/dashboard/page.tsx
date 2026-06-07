'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Code, Bug, BookOpen, Database, ArrowRight } from 'lucide-react';

const tools = [
  {
    href: '/dashboard/resume',
    title: 'Resume Analyzer',
    description: 'Get AI-powered feedback on your resume with actionable improvement suggestions',
    icon: FileText,
    color: 'from-blue-600 to-blue-700',
  },
  {
    href: '/dashboard/github',
    title: 'GitHub Explainer',
    description: 'Understand any GitHub repository with AI-generated architecture overviews',
    icon: Code,
    color: 'from-cyan-600 to-cyan-700',
  },
  {
    href: '/dashboard/debug',
    title: 'Bug Fixer',
    description: 'Debug your code with AI-powered error analysis and solutions',
    icon: Bug,
    color: 'from-indigo-600 to-indigo-700',
  },
  {
    href: '/dashboard/docs',
    title: 'Documentation Writer',
    description: 'Generate professional documentation for your code automatically',
    icon: BookOpen,
    color: 'from-sky-600 to-sky-700',
  },
  {
    href: '/dashboard/sql',
    title: 'SQL Helper',
    description: 'Convert natural language to optimized SQL queries with explanations',
    icon: Database,
    color: 'from-teal-600 to-teal-700',
  },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchUsageCount();
    }
  }, [session]);

  const fetchUsageCount = async () => {
    try {
      const response = await fetch('/api/user/usage');
      if (response.ok) {
        const data = await response.json();
        setUsageCount(data.usageCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch usage count:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
          Welcome back, {session?.user?.name || session?.user?.email?.split('@')[0]}!
        </h1>
        <p className="text-gray-300 text-lg leading-relaxed">
          Choose an AI-powered tool to get started
        </p>
      </div>

      <Card className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white text-2xl font-semibold">Your Usage</CardTitle>
          <CardDescription className="text-gray-300 text-base">
            You've used DevPilot {usageCount} times
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.href} href={tool.href}>
              <Card className="h-full backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 cursor-pointer">
                <CardHeader>
                  <div className={`w-14 h-14 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-white text-xl font-semibold">{tool.title}</CardTitle>
                  <CardDescription className="text-gray-300 text-base leading-relaxed">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-gray-300 hover:bg-white/10 hover:text-white font-semibold">
                    Open Tool
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
