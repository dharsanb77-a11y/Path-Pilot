import React from 'react';
import { User } from '../types';
import { 
  Compass, UserCheck, LogOut, SlidersHorizontal, BookOpen, 
  Lightbulb, CheckSquare, Sparkles, Wallet, GraduationCap, Briefcase, Bot, Bell 
} from 'lucide-react';

interface HeaderProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDataEntry: () => void;
  onOpenInterestChange: () => void;
  onSignOut: () => void;
  onOpenAuth: () => void;
  onOpenCopilot?: () => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenDataEntry,
  onOpenInterestChange,
  onSignOut,
  onOpenAuth,
  onOpenCopilot,
  unreadNotificationsCount = 0,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'intelligence', label: 'Intelligence', icon: Bot },
    { id: 'placement', label: 'Placement Hub', icon: Briefcase },
    { id: 'learning', label: 'AI Learning Hub', icon: GraduationCap },
    { id: 'expenses', label: 'My Expenses', icon: Wallet },
    { id: 'projects', label: 'Project Ideas', icon: Lightbulb },
    { id: 'evaluator', label: 'AI Evaluator', icon: Sparkles },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'roadmap', label: 'Career Roadmap', icon: CheckSquare },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'ST';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold tracking-tight shadow-sm transition-transform group-hover:scale-105">
                <Compass className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                  PathPilot
                </span>
                <span className="text-[11px] text-slate-500 font-medium tracking-wide">
                  Academic Growth & Career Path
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary user actions */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2">
                {onOpenCopilot && (
                  <button
                    onClick={onOpenCopilot}
                    title="Open AI Career Copilot"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap shadow-xs"
                  >
                    <Bot className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Copilot</span>
                  </button>
                )}

                <button
                  onClick={onOpenDataEntry}
                  title="Update profile & add skills"
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Log Data</span>
                </button>

                <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                  <button
                    onClick={onOpenInterestChange}
                    className="flex items-center gap-2 text-left p-1 rounded-md hover:bg-slate-50 transition-colors"
                    title="Change domain interest & focus"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 tracking-tight">
                      {getInitials(user.name)}
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className="text-xs font-semibold text-slate-900 truncate max-w-[130px]">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                        {user.interest || user.department}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={onSignOut}
                    title="Sign Out"
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 px-2 py-1.5 bg-slate-50/80 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium rounded transition-colors shrink-0 ${
                isActive ? 'text-slate-900 font-semibold' : 'text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
