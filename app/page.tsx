import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Code, Bug, BookOpen, Database, ArrowRight, Zap, Shield, Rocket, Users, CheckCircle2 } from 'lucide-react';

const tools = [
  {
    title: 'Resume Analyzer',
    description: 'Get AI-powered feedback on your resume with actionable improvement suggestions',
    icon: FileText,
    color: 'from-blue-600 to-blue-700',
    features: ['ATS optimization', 'Keyword analysis', 'Format recommendations']
  },
  {
    title: 'GitHub Explainer',
    description: 'Understand any GitHub repository with AI-generated architecture overviews',
    icon: Code,
    color: 'from-cyan-600 to-cyan-700',
    features: ['Code structure analysis', 'Dependency mapping', 'Documentation generation']
  },
  {
    title: 'Bug Fixer',
    description: 'Debug your code with AI-powered error analysis and solutions',
    icon: Bug,
    color: 'from-indigo-600 to-indigo-700',
    features: ['Error diagnosis', 'Solution suggestions', 'Best practices']
  },
  {
    title: 'Documentation Writer',
    description: 'Generate professional documentation for your code automatically',
    icon: BookOpen,
    color: 'from-sky-600 to-sky-700',
    features: ['Auto-generated docs', 'Multiple formats', 'API documentation']
  },
  {
    title: 'SQL Helper',
    description: 'Convert natural language to optimized SQL queries with explanations',
    icon: Database,
    color: 'from-teal-600 to-teal-700',
    features: ['Natural language to SQL', 'Query optimization', 'Multiple dialects']
  },
];

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Get instant AI responses with our optimized streaming technology'
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your code and data are encrypted and never stored'
  },
  {
    icon: Rocket,
    title: 'Boost Productivity',
    description: 'Save hours of manual work with intelligent automation'
  },
  {
    icon: Users,
    title: 'Trusted by Developers',
    description: 'Join thousands of developers who use DevPilot daily'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <nav className="backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Image 
                src="/devpilot_logo.png" 
                alt="DevPilot Logo" 
                width={40} 
                height={40}
                className="rounded-lg"
              />
              <h1 className="text-2xl font-bold text-white tracking-tight">
                DevPilot
              </h1>
            </div>
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:bg-white/10 backdrop-blur-sm font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-500/30">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
            AI-Powered Developer Tools
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Supercharge your development workflow with 5 intelligent AI tools designed to help you code faster, debug smarter, and build better. Transform your productivity with cutting-edge AI technology.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-500/30">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="
    border-white/40 
    bg-white/5 
    text-white 
    hover:bg-white/15 
    hover:text-white 
    hover:border-white/60 
    backdrop-blur-sm 
    font-semibold
  "
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card key={tool.title} className="backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20">
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
                  <ul className="space-y-2">
                    {tool.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white mb-12 text-center tracking-tight">Why Choose DevPilot?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-20">
          <Card className="backdrop-blur-xl bg-white/5 border border-white/10">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-white mb-4">How It Works</CardTitle>
              <CardDescription className="text-gray-300 text-lg">Get started in 3 simple steps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">1</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Sign Up</h3>
                  <p className="text-gray-400">Create your free account in seconds</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">2</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Choose a Tool</h3>
                  <p className="text-gray-400">Select from our 5 AI-powered tools</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">3</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Get Results</h3>
                  <p className="text-gray-400">Receive instant AI-powered insights</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Ready to boost your productivity?
          </h2>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
            Join thousands of developers using DevPilot to build better software faster. Start your free trial today and experience the future of development.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-500/30">
              Create Free Account
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2026 DevPilot. All rights reserved. Built By Rishi Patel</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
