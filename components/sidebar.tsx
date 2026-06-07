'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  FileText, 
  Code, 
  Bug, 
  BookOpen, 
  Database,
  LogOut,
  User
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/resume', label: 'Resume Analyzer', icon: FileText },
  { href: '/dashboard/github', label: 'GitHub Explainer', icon: Code },
  { href: '/dashboard/debug', label: 'Bug Fixer', icon: Bug },
  { href: '/dashboard/docs', label: 'Documentation', icon: BookOpen },
  { href: '/dashboard/sql', label: 'SQL Helper', icon: Database },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 backdrop-blur-xl bg-white/5 border-r border-white/10 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Image 
            src="/devpilot_logo.png" 
            alt="DevPilot Logo" 
            width={40} 
            height={40}
            className="rounded-lg"
          />
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">DevPilot</h1>
            <p className="text-gray-400 text-xs mt-1">AI-Powered Developer Tools</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-4">
        {session?.user && (
          <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
              {session.user.name?.[0] || session.user.email?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {session.user.name || session.user.email}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {session.user.email}
              </p>
            </div>
          </div>
        )}
        
        <Button
          variant="outline"
          className="w-full justify-start gap-2 border-white/40 bg-white/5 text-white hover:bg-white/15 hover:!text-white hover:border-white/60 backdrop-blur-sm font-semibold"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
