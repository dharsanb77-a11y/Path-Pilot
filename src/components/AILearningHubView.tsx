import React, { useState } from 'react';
import { 
  User, DetailedSkill, LearningGoal, LearningRoadmapMilestone, 
  LearningStreakData, LearningActivitySession, CareerAlignmentData, 
  AILearningInsights, SkillType, SkillStatus, SkillLevel, AchievementBadge, SkillGapItem 
} from '../types';
import { 
  GraduationCap, Flame, Sparkles, Target, Award, CheckCircle2, 
  Circle, Clock, BookOpen, ExternalLink, Plus, Filter, 
  Search, ArrowRight, RefreshCw, Layers, TrendingUp, AlertTriangle, 
  CheckSquare, BarChart3, ShieldCheck, Zap, Youtube, BookMarked, 
  Code2, Compass, ChevronDown, ChevronRight, X, PlayCircle, Calendar
} from 'lucide-react';

interface AILearningHubViewProps {
  user: User;
  skills: DetailedSkill[];
  goals: LearningGoal[];
  streakData: LearningStreakData;
  learningRoadmap: LearningRoadmapMilestone[];
  activitySessions: LearningActivitySession[];
  careerAlignment: CareerAlignmentData;
  learningInsights: AILearningInsights;
  onUpdateSkill: (skillId: string, updates: Partial<DetailedSkill>) => void;
  onAddSkill: (newSkill: DetailedSkill) => void;
  onDeleteSkill: (skillId: string) => void;
  onToggleGoal: (goalId: string) => void;
  onAddGoal: (newGoal: LearningGoal) => void;
  onDeleteGoal: (goalId: string) => void;
  onToggleRoadmapTopic: (milestoneId: string, topicId: string) => void;
  onLogActivity: (minutes: number, topicsCovered: string, skillName: string) => void;
  onRefreshInsights: () => Promise<void>;
  onUpdateTargetRole: (newRole: string) => void;
  isAnalyzing?: boolean;
}

export const AILearningHubView: React.FC<AILearningHubViewProps> = ({
  user,
  skills,
  goals,
  streakData,
  learningRoadmap,
  activitySessions,
  careerAlignment,
  learningInsights,
  onUpdateSkill,
  onAddSkill,
  onDeleteSkill,
  onToggleGoal,
  onAddGoal,
  onDeleteGoal,
  onToggleRoadmapTopic,
  onLogActivity,
  onRefreshInsights,
  onUpdateTargetRole,
  isAnalyzing = false,
}) => {
  // Navigation inside AI Learning Hub
  const [hubTab, setHubTab] = useState<'overview' | 'skills' | 'roadmap' | 'goals' | 'resources' | 'activity'>('overview');

  // Skill filter states
  const [skillTypeFilter, setSkillTypeFilter] = useState<'All' | 'Technical' | 'Soft'>('All');
  const [skillStatusFilter, setSkillStatusFilter] = useState<string>('All');
  const [skillLevelFilter, setSkillLevelFilter] = useState<string>('All');
  const [skillSearchQuery, setSkillSearchQuery] = useState('');

  // Modals state
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showLogActivityModal, setShowLogActivityModal] = useState(false);
  const [showTargetRoleModal, setShowTargetRoleModal] = useState(false);
  const [selectedSkillForHistory, setSelectedSkillForHistory] = useState<DetailedSkill | null>(null);

  // New Skill form state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillType, setNewSkillType] = useState<SkillType>('Technical');
  const [newSkillCategory, setNewSkillCategory] = useState<any>('Cloud');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('Intermediate');
  const [newSkillStatus, setNewSkillStatus] = useState<SkillStatus>('Learning');
  const [newSkillProgress, setNewSkillProgress] = useState(65);

  // New Goal form state
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTimeframe, setNewGoalTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [newGoalCategory, setNewGoalCategory] = useState('Cloud & Observability');
  const [newGoalTargetDate, setNewGoalTargetDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [newGoalNotes, setNewGoalNotes] = useState('');

  // Log Activity form state
  const [logMinutes, setLogMinutes] = useState(45);
  const [logTopics, setLogTopics] = useState('');
  const [logSkillName, setLogSkillName] = useState(skills[0]?.name || 'Docker & Container Architecture');

  // Resource Filter
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('All');

  // Computed metrics
  const technicalSkills = skills.filter((s) => s.type === 'Technical');
  const softSkills = skills.filter((s) => s.type === 'Soft');
  const completedSkillsCount = skills.filter((s) => s.status === 'Completed').length;
  const learningSkillsCount = skills.filter((s) => s.status === 'Learning').length;
  const plannedSkillsCount = skills.filter((s) => s.status === 'Planned').length;

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.completed).length;
  const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Filtered skills
  const filteredSkills = skills.filter((skill) => {
    if (skillTypeFilter !== 'All' && skill.type !== skillTypeFilter) return false;
    if (skillStatusFilter !== 'All' && skill.status !== skillStatusFilter) return false;
    if (skillLevelFilter !== 'All' && skill.level !== skillLevelFilter) return false;
    if (skillSearchQuery.trim() !== '') {
      const q = skillSearchQuery.toLowerCase();
      return (
        skill.name.toLowerCase().includes(q) ||
        skill.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate Roadmap Progress
  const totalRoadmapTopics = learningRoadmap.reduce((acc, m) => acc + m.topics.length, 0);
  const completedRoadmapTopics = learningRoadmap.reduce(
    (acc, m) => acc + m.topics.filter((t) => t.completed).length,
    0
  );
  const calculatedRoadmapProgress =
    totalRoadmapTopics > 0 ? Math.round((completedRoadmapTopics / totalRoadmapTopics) * 100) : 0;

  // All roadmap resources for Curated Resources tab
  const allCuratedResources = learningRoadmap.flatMap((m) =>
    m.resources.map((r, idx) => ({
      ...r,
      milestoneId: m.id,
      milestoneTitle: m.title,
      difficulty: m.difficulty,
      uniqueId: `${m.id}-res-${idx}`,
    }))
  );

  const filteredCuratedResources = allCuratedResources.filter((res) => {
    if (resourceTypeFilter === 'All') return true;
    return res.type === resourceTypeFilter;
  });

  const handleCreateSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newSkill: DetailedSkill = {
      id: `skill-custom-${Date.now()}`,
      name: newSkillName.trim(),
      type: newSkillType,
      category: newSkillCategory,
      level: newSkillLevel,
      status: newSkillStatus,
      progress: Number(newSkillProgress) || 50,
      hoursSpent: 5,
      lastPracticed: new Date().toISOString().split('T')[0],
      history: [
        {
          date: new Date().toISOString().split('T')[0],
          progress: Number(newSkillProgress) || 50,
          note: 'Skill added to learning curriculum',
        },
      ],
    };

    onAddSkill(newSkill);
    setShowAddSkillModal(false);
    setNewSkillName('');
  };

  const handleCreateGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const newGoal: LearningGoal = {
      id: `goal-${Date.now()}`,
      title: newGoalTitle.trim(),
      timeframe: newGoalTimeframe,
      skillCategory: newGoalCategory,
      targetDate: newGoalTargetDate,
      completed: false,
      notes: newGoalNotes.trim() || undefined,
    };

    onAddGoal(newGoal);
    setShowAddGoalModal(false);
    setNewGoalTitle('');
    setNewGoalNotes('');
  };

  const handleLogActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTopics.trim()) return;

    onLogActivity(Number(logMinutes) || 30, logTopics.trim(), logSkillName);
    setShowLogActivityModal(false);
    setLogTopics('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: AI Learning Hub Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-800 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <GraduationCap className="w-3.5 h-3.5" />
                Phase 3: AI Learning & Skill Development
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600 font-normal">{user.department}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600 font-normal">{user.year}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                AI Learning Hub
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Target Role:</span>
                <button
                  onClick={() => setShowTargetRoleModal(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                  title="Click to change target role"
                >
                  <span>{careerAlignment.targetRole || user.targetRole || 'Cloud & Infrastructure Engineer'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
              Dynamically identify skill strengths and gaps, progress through a personalized engineering roadmap, track daily learning streaks, and align competencies to industry expectations.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={() => setShowLogActivityModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Log Practice Session</span>
            </button>

            <button
              onClick={() => onRefreshInsights()}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-xl transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
              <span>{isAnalyzing ? 'Evaluating...' : 'AI Re-Analyze'}</span>
            </button>
          </div>
        </div>

        {/* Top Level Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          {/* Tile 1: Dynamic Career Alignment */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Career Alignment</span>
              <Target className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                {careerAlignment.score}
              </span>
              <span className="text-xs font-semibold text-slate-500">/ 100</span>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded ml-auto">
                Goal: {careerAlignment.targetRoleBenchmark}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${careerAlignment.score}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
              <span>{careerAlignment.skillGaps.length} gaps identified</span>
              <span className="font-semibold text-slate-700">{careerAlignment.strengths.length} verified strengths</span>
            </div>
          </div>

          {/* Tile 2: Learning Streak */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Learning Habit Streak</span>
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                {streakData.currentStreak}
              </span>
              <span className="text-xs font-semibold text-slate-500">Days Active</span>
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded ml-auto">
                Best: {streakData.longestStreak}d
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
              <span>{streakData.totalDays} Total Practice Days</span>
              <span className="font-semibold text-slate-700 tabular-nums">{streakData.totalHours} hrs logged</span>
            </div>
          </div>

          {/* Tile 3: Technical & Soft Skill Balance */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Skills Portfolio</span>
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                {skills.length}
              </span>
              <span className="text-xs font-semibold text-slate-500">Total Skills</span>
              <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded ml-auto">
                {completedSkillsCount} Completed
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-2">
              <span className="font-semibold text-slate-800">{technicalSkills.length} Technical</span>
              <span className="text-slate-300">·</span>
              <span className="font-semibold text-slate-800">{softSkills.length} Soft Skills</span>
            </div>
          </div>

          {/* Tile 4: Roadmap & Goal Completion */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Roadmap & Goals</span>
              <CheckSquare className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                {calculatedRoadmapProgress}%
              </span>
              <span className="text-xs font-semibold text-slate-500">Roadmap</span>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded ml-auto">
                {goalCompletionRate}% Goals Done
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-slate-900 h-full rounded-full transition-all duration-500"
                style={{ width: `${calculatedRoadmapProgress}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
              <span>{completedRoadmapTopics} / {totalRoadmapTopics} Topics Done</span>
              <span className="font-semibold text-slate-700">{completedGoals} of {totalGoals} Goals</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'AI Insights & Alignment', icon: Sparkles },
          { id: 'skills', label: `Skill Matrix (${skills.length})`, icon: Layers },
          { id: 'roadmap', label: `Personalized Roadmap (${calculatedRoadmapProgress}%)`, icon: Compass },
          { id: 'goals', label: `Learning Goals (${completedGoals}/${totalGoals})`, icon: Target },
          { id: 'resources', label: 'Curated Recommendations', icon: BookOpen },
          { id: 'activity', label: 'Habit Streaks & Badges', icon: Flame },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = hubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setHubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-slate-900 text-slate-900 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & AI INSIGHTS */}
      {hubTab === 'overview' && (
        <div className="space-y-8">
          {/* Executive Summary Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold">AI Skill Intelligence Assessment</h2>
                  <p className="text-xs text-slate-400">Grounded in evaluated projects, active roadmaps, and streak consistency</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[11px] text-slate-400 font-mono">Consistency Score</div>
                  <div className="text-lg font-extrabold text-emerald-400 tabular-nums">
                    {learningInsights.consistencyScore} / 100
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-emerald-500/40 flex items-center justify-center font-bold text-xs">
                  {learningInsights.consistencyScore}%
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              {learningInsights.learningSummary}
            </p>

            {/* Next Recommended Skill Callout */}
            {learningInsights.nextRecommendedSkill && (
              <div className="mt-6 bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                      Single Highest Impact Next Skill
                    </div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {learningInsights.nextRecommendedSkill.name}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      {learningInsights.nextRecommendedSkill.reason}
                    </p>
                    <div className="text-[11px] text-slate-400 mt-1.5 font-mono">
                      Target Milestone: {learningInsights.nextRecommendedSkill.targetMilestone}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setHubTab('roadmap')}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap self-start sm:self-center"
                >
                  <span>Start in Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Fastest Improving vs Needing Attention */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fastest Improving Skills */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Fastest-Improving Skills</h3>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ml-auto font-medium">
                  High Momentum
                </span>
              </div>
              <div className="space-y-3">
                {learningInsights.fastestImprovingSkills.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500">Verified through project commits & evaluation</div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-1 rounded font-mono">
                      {item.growth}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Needing Attention */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Skills Needing Attention</h3>
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full ml-auto font-medium">
                  Role Gap
                </span>
              </div>
              <div className="space-y-3">
                {learningInsights.skillsNeedingAttention.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/60"
                  >
                    <div className="text-xs font-bold text-slate-900">{item.name}</div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Career Alignment Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
                  <Target className="w-4 h-4" />
                  <span>Dynamic Role Match & Benchmark</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Alignment to {careerAlignment.targetRole}
                </h3>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 self-start sm:self-center">
                <div className="text-right">
                  <div className="text-[11px] text-slate-500 font-medium">Student Readiness</div>
                  <div className="text-lg font-bold text-slate-900 tabular-nums">
                    {careerAlignment.score}%
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Target Benchmark</div>
                  <div className="text-lg font-bold text-slate-600 tabular-nums">
                    {careerAlignment.targetRoleBenchmark}%
                  </div>
                </div>
              </div>
            </div>

            {/* Role Comparison Visual Bar Grid */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                5-Dimension Industry Competency Breakdown
              </h4>
              <div className="space-y-3.5">
                {careerAlignment.roleComparison.map((comp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{comp.metric}</span>
                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span className="text-emerald-700 font-bold">You: {comp.studentScore}%</span>
                        <span className="text-slate-400">Baseline: {comp.industryBaseline}%</span>
                      </div>
                    </div>
                    <div className="relative w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      {/* Baseline marker */}
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                        style={{ left: `${comp.industryBaseline}%` }}
                        title={`Industry Baseline: ${comp.industryBaseline}%`}
                      />
                      {/* Student bar */}
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          comp.studentScore >= comp.industryBaseline ? 'bg-emerald-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${comp.studentScore}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Identified Skill Gaps & Recommended Actions Table */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Identified Skill Gaps & Targeted Actions
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Skill Gap</th>
                      <th className="py-2.5 px-3">Importance</th>
                      <th className="py-2.5 px-3">Current Level</th>
                      <th className="py-2.5 px-3">Target Level</th>
                      <th className="py-2.5 px-3">Actionable Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {careerAlignment.skillGaps.map((gap, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{gap.skill}</td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            gap.importance === 'High' 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {gap.importance} Priority
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">{gap.currentLevel}</td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-700">{gap.requiredLevel}</td>
                        <td className="py-2.5 px-3 text-slate-700 max-w-xs">{gap.recommendation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actionable Improvement Suggestions List */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Next Concrete Actions to Increase Score</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {learningInsights.actionableSuggestions.map((sug, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{sug}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SKILL MATRIX */}
      {hubTab === 'skills' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {/* Technical vs Soft Pill */}
                <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
                  {(['All', 'Technical', 'Soft'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSkillTypeFilter(type)}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        skillTypeFilter === type
                          ? 'bg-white text-slate-900 shadow-xs font-bold'
                          : 'hover:text-slate-900'
                      }`}
                    >
                      {type} Skills
                    </button>
                  ))}
                </div>

                {/* Status Filter */}
                <select
                  value={skillStatusFilter}
                  onChange={(e) => setSkillStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="All">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Learning">Currently Learning</option>
                  <option value="Planned">Planned</option>
                </select>

                {/* Level Filter */}
                <select
                  value={skillLevelFilter}
                  onChange={(e) => setSkillLevelFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search skills..."
                    value={skillSearchQuery}
                    onChange={(e) => setSkillSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 w-40 sm:w-52"
                  />
                </div>

                <button
                  onClick={() => setShowAddSkillModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Skill</span>
                </button>
              </div>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((skill) => (
              <div 
                key={skill.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {skill.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        skill.level === 'Advanced' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : skill.level === 'Intermediate'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {skill.level}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        skill.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : skill.status === 'Learning'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {skill.status}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {skill.name}
                  </h4>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span className="font-medium text-slate-600">{skill.type} Skill</span>
                    <span>·</span>
                    <span>{skill.hoursSpent} hrs practiced</span>
                    <span>·</span>
                    <span className="font-mono">{skill.lastPracticed}</span>
                  </div>
                </div>

                {/* Progress Slider */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Proficiency:</span>
                    <span className="font-bold text-slate-900 tabular-nums">{skill.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={skill.progress}
                    onChange={(e) => {
                      const newProgress = Number(e.target.value);
                      const newStatus: SkillStatus = newProgress >= 90 ? 'Completed' : newProgress > 25 ? 'Learning' : 'Planned';
                      const newLevel: SkillLevel = newProgress >= 80 ? 'Advanced' : newProgress >= 50 ? 'Intermediate' : 'Beginner';
                      onUpdateSkill(skill.id, {
                        progress: newProgress,
                        status: newStatus,
                        level: newLevel,
                        lastPracticed: new Date().toISOString().split('T')[0],
                      });
                    }}
                    className="w-full accent-slate-900 cursor-pointer"
                  />
                </div>

                {/* Status Switcher & History Button */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    {(['Planned', 'Learning', 'Completed'] as SkillStatus[]).map((statusOption) => (
                      <button
                        key={statusOption}
                        onClick={() => {
                          const targetProgress = statusOption === 'Completed' ? 90 : statusOption === 'Learning' ? 65 : 20;
                          onUpdateSkill(skill.id, {
                            status: statusOption,
                            progress: skill.status !== statusOption ? targetProgress : skill.progress,
                          });
                        }}
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${
                          skill.status === statusOption
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {statusOption}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    {skill.history && skill.history.length > 0 && (
                      <button
                        onClick={() => setSelectedSkillForHistory(skill)}
                        className="text-[11px] text-slate-500 hover:text-slate-900 font-medium underline"
                      >
                        History
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteSkill(skill.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Delete skill"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSkills.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No skills match the selected filter</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting the filters or add a new skill to track.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PERSONALIZED LEARNING ROADMAP */}
      {hubTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                <span>Domain-Calibrated Curriculum</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Personalized Learning Roadmap for {user.interest || 'Distributed Systems'}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Progress through verified milestone checkpoints. Checking topics automatically updates roadmap completion and career readiness.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-right self-start sm:self-center">
              <div className="text-[11px] text-slate-500 font-medium">Roadmap Progress</div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {calculatedRoadmapProgress}%
              </div>
            </div>
          </div>

          {/* Milestones Accordion */}
          <div className="space-y-4">
            {learningRoadmap.map((milestone, mIdx) => {
              const completedTopics = milestone.topics.filter((t) => t.completed).length;
              const milestonePercent = milestone.topics.length > 0
                ? Math.round((completedTopics / milestone.topics.length) * 100)
                : 0;

              return (
                <div
                  key={milestone.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white">
                          Milestone {mIdx + 1}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          milestone.difficulty === 'Advanced' 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : milestone.difficulty === 'Intermediate'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {milestone.difficulty}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          milestonePercent === 100
                            ? 'bg-emerald-100 text-emerald-800'
                            : milestonePercent > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {milestonePercent === 100 ? 'Completed' : milestonePercent > 0 ? 'In Progress' : 'Planned'}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 ml-2">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{milestone.estimatedTime}</span>
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 pt-1">
                        {milestone.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                        {milestone.description}
                      </p>
                    </div>

                    {/* Progress Badge */}
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-slate-900 tabular-nums">
                        {completedTopics} / {milestone.topics.length} Topics
                      </div>
                      <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
                        <div 
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${milestonePercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Topics Checklist */}
                  <div className="pt-3 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                      Syllabus Topics & Practice Exercises
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {milestone.topics.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => onToggleRoadmapTopic(milestone.id, topic.id)}
                          className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-colors ${
                            topic.completed 
                              ? 'bg-emerald-50/40 border-emerald-200 text-slate-800' 
                              : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="mt-0.5">
                            {topic.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                          </div>
                          <div className="flex-1">
                            <span className={`text-xs ${topic.completed ? 'line-through text-slate-500' : 'font-medium'}`}>
                              {topic.title}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              ~{topic.estimatedHours} hrs study time
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Curated Resources for this milestone */}
                  {milestone.resources && milestone.resources.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        <span>Curated References & Practice Labs for this Milestone</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {milestone.resources.map((res, rIdx) => (
                          <a
                            key={rIdx}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex flex-col justify-between group"
                          >
                            <div>
                              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                                <span className="font-semibold text-slate-700">{res.type}</span>
                                {res.isFree && (
                                  <span className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">
                                    Free
                                  </span>
                                )}
                              </div>
                              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                                {res.title}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                              <span>{res.platform}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-700" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: LEARNING GOALS & CONSISTENCY */}
      {hubTab === 'goals' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                <span>Accountability & Daily Practice</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Daily, Weekly, and Monthly Learning Goals
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Maintain consistency by setting micro-milestones aligned with your domain roadmap.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-right">
                <div className="text-[11px] text-slate-500 font-medium">Goal Completion</div>
                <div className="text-lg font-bold text-slate-900 tabular-nums">
                  {completedGoals} / {totalGoals} ({goalCompletionRate}%)
                </div>
              </div>

              <button
                onClick={() => setShowAddGoalModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Goal</span>
              </button>
            </div>
          </div>

          {/* Timeframe Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['Daily', 'Weekly', 'Monthly'] as const).map((timeframe) => {
              const tfGoals = goals.filter((g) => g.timeframe === timeframe);
              return (
                <div key={timeframe} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          timeframe === 'Daily' ? 'bg-amber-500' : timeframe === 'Weekly' ? 'bg-blue-500' : 'bg-purple-500'
                        }`} />
                        <h3 className="text-sm font-bold text-slate-900">{timeframe} Goals</h3>
                      </div>
                      <span className="text-xs font-mono text-slate-500">
                        {tfGoals.filter((g) => g.completed).length} / {tfGoals.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {tfGoals.map((goal) => (
                        <div
                          key={goal.id}
                          className={`p-3 rounded-lg border transition-all ${
                            goal.completed
                              ? 'bg-emerald-50/40 border-emerald-200'
                              : 'bg-slate-50/60 border-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <button
                              onClick={() => onToggleGoal(goal.id)}
                              className="mt-0.5 shrink-0"
                            >
                              {goal.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                              )}
                            </button>
                            <div className="flex-1">
                              <div className={`text-xs font-bold leading-snug ${
                                goal.completed ? 'line-through text-slate-500' : 'text-slate-900'
                              }`}>
                                {goal.title}
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                                <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                                  {goal.skillCategory}
                                </span>
                                <span className="font-mono">Due: {goal.targetDate}</span>
                              </div>
                              {goal.notes && (
                                <p className="text-[11px] text-slate-500 mt-1.5 italic bg-white/60 p-1.5 rounded">
                                  "{goal.notes}"
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => onDeleteGoal(goal.id)}
                              className="text-slate-300 hover:text-rose-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {tfGoals.length === 0 && (
                        <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                          No {timeframe.toLowerCase()} goals yet. Click "New Goal" above.
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setNewGoalTimeframe(timeframe);
                      setShowAddGoalModal(true);
                    }}
                    className="w-full mt-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add {timeframe} Goal</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: CURATED RECOMMENDATIONS */}
      {hubTab === 'resources' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Multi-Platform Resources</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Recommended Courses, Tutorials, Practice Platforms & Video Lectures
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Authoritative content matching your identified skill gaps and roadmap progress.
              </p>
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              {(['All', 'Course', 'Documentation', 'Tutorial', 'Practice Platform', 'YouTube'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setResourceTypeFilter(t)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    resourceTypeFilter === t
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCuratedResources.map((res) => (
              <div
                key={res.uniqueId}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      {res.type === 'YouTube' ? (
                        <Youtube className="w-3.5 h-3.5 text-rose-600" />
                      ) : res.type === 'Practice Platform' ? (
                        <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <BookMarked className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>{res.type}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                        {res.difficulty}
                      </span>
                      {res.isFree && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-mono">
                          Free
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {res.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Platform: <span className="font-semibold text-slate-700">{res.platform}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    Milestone: {res.milestoneTitle}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Verified Curriculum</span>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-emerald-700 transition-colors"
                  >
                    <span>Launch</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: HABIT STREAKS & BADGES */}
      {hubTab === 'activity' && (
        <div className="space-y-6">
          {/* Streak Banner */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                  <Flame className="w-8 h-8 text-white fill-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white/80 uppercase tracking-wider">Active Habit Momentum</div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white">
                    {streakData.currentStreak} Day Learning Streak
                  </div>
                  <p className="text-xs text-white/90 mt-1">
                    Keep practicing daily to unlock the Century Study Club badge and maximize your consistency score.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl px-5 py-3 self-start sm:self-center">
                <div className="text-center">
                  <div className="text-[11px] text-white/80">Longest Streak</div>
                  <div className="text-xl font-bold text-white tabular-nums">{streakData.longestStreak} days</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <div className="text-[11px] text-white/80">Total Practice</div>
                  <div className="text-xl font-bold text-white tabular-nums">{streakData.totalHours} hrs</div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievement Badges Grid */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Achievement Badges</h3>
                <p className="text-xs text-slate-500">Milestones unlocked based on streaks, skills, and evaluated projects</p>
              </div>
              <span className="text-xs font-bold text-slate-800 font-mono">
                {streakData.badges.filter((b) => b.achieved).length} / {streakData.badges.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {streakData.badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    badge.achieved
                      ? 'bg-slate-50/80 border-slate-200'
                      : 'bg-slate-50/30 border-slate-200/50 opacity-60'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    badge.achieved ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-400'
                  }`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900">{badge.title}</h4>
                      {badge.achieved && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {badge.description}
                    </p>
                    {badge.unlockedAt && (
                      <div className="text-[10px] text-slate-400 mt-1.5 font-mono">
                        Unlocked on {badge.unlockedAt}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Learning Sessions History */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Learning Activity History</h3>
                <p className="text-xs text-slate-500">Log of daily practice sessions and topics covered</p>
              </div>

              <button
                onClick={() => setShowLogActivityModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Session</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {activitySessions.map((session) => (
                <div key={session.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{session.topicsCovered}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-semibold text-slate-700">{session.skillName}</span>
                      <span>·</span>
                      <span className="font-mono">{session.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md self-start sm:self-center font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>+{session.minutes} mins</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD NEW SKILL */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Skill to Tracker</h3>
              <button
                onClick={() => setShowAddSkillModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSkillSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Tracing, eBPF, System Design"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Skill Type</label>
                  <select
                    value={newSkillType}
                    onChange={(e) => setNewSkillType(e.target.value as SkillType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Soft">Soft</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    {newSkillType === 'Technical' ? (
                      <>
                        <option value="Cloud">Cloud</option>
                        <option value="Programming">Programming</option>
                        <option value="DSA">DSA / Algorithms</option>
                        <option value="Web Development">Web Development</option>
                        <option value="AI/ML">AI/ML</option>
                        <option value="Database">Database</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                        <option value="System Design">System Design</option>
                      </>
                    ) : (
                      <>
                        <option value="Communication">Communication</option>
                        <option value="Teamwork">Teamwork</option>
                        <option value="Leadership">Leadership</option>
                        <option value="Problem Solving">Problem Solving</option>
                        <option value="Time Management">Time Management</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Proficiency Level</label>
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value as SkillLevel)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={newSkillStatus}
                    onChange={(e) => setNewSkillStatus(e.target.value as SkillStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Planned">Planned</option>
                    <option value="Learning">Learning</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Initial Progress</label>
                  <span className="font-bold text-slate-900 font-mono">{newSkillProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newSkillProgress}
                  onChange={(e) => setNewSkillProgress(Number(e.target.value))}
                  className="w-full accent-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSkillModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-xs"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW GOAL */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Set Learning Goal</h3>
              <button
                onClick={() => setShowAddGoalModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoalSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read Raft log compaction paper section 7"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Timeframe</label>
                  <select
                    value={newGoalTimeframe}
                    onChange={(e) => setNewGoalTimeframe(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Daily">Daily Goal</option>
                    <option value="Weekly">Weekly Goal</option>
                    <option value="Monthly">Monthly Milestone</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={newGoalTargetDate}
                    onChange={(e) => setNewGoalTargetDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skill Category</label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems, Cloud, Algorithms"
                  value={newGoalCategory}
                  onChange={(e) => setNewGoalCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Success Criteria (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Complete interactive exercises on KillerCoda"
                  value={newGoalNotes}
                  onChange={(e) => setNewGoalNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-xs"
                >
                  Add Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: LOG ACTIVITY */}
      {showLogActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Log Practice Session</h3>
              <button
                onClick={() => setShowLogActivityModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogActivitySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skill Practiced</label>
                <select
                  value={logSkillName}
                  onChange={(e) => setLogSkillName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                >
                  {skills.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Time Spent (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  required
                  value={logMinutes}
                  onChange={(e) => setLogMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">What did you study / build?</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Completed KillerCoda lab on Kubernetes Pod lifecycle and wrote deployment manifests"
                  value={logTopics}
                  onChange={(e) => setLogTopics(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogActivityModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-xs"
                >
                  Save Practice Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CHANGE TARGET ROLE */}
      {showTargetRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Select Target Career Role</h3>
              <button
                onClick={() => setShowTargetRoleModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Changing your target role re-calibrates your Career Alignment Score, identified skill gaps, and roadmap milestones.
            </p>

            <div className="space-y-2 text-xs">
              {[
                'Cloud & Infrastructure Engineer',
                'Distributed Systems Architect',
                'Full Stack Software Engineer',
                'AI & Machine Learning Engineer',
                'Data Platform / ETL Engineer',
                'Site Reliability Engineer (SRE)',
                'Cybersecurity Operations Analyst',
              ].map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    onUpdateTargetRole(role);
                    setShowTargetRoleModal(false);
                  }}
                  className={`w-full p-3 rounded-lg text-left font-semibold border transition-all ${
                    careerAlignment.targetRole === role
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: SKILL PROGRESS HISTORY */}
      {selectedSkillForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedSkillForHistory.name}
                </h3>
                <span className="text-xs text-slate-500 font-mono">Progression History</span>
              </div>
              <button
                onClick={() => setSelectedSkillForHistory(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {selectedSkillForHistory.history?.map((hist, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-500 mb-1">
                    <span>{hist.date}</span>
                    <span className="font-bold text-slate-800">{hist.progress}% proficiency</span>
                  </div>
                  <p className="text-slate-700 leading-snug">{hist.note || 'Milestone achieved'}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedSkillForHistory(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
