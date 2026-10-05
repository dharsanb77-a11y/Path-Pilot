import React, { useState } from 'react';
import { 
  User, SkillMetric, HistoricalScore, ProjectSubmission, 
  RoadmapMilestone, ExpenseItem, DetailedSkill, LearningGoal, 
  LearningRoadmapMilestone, LearningStreakData, CareerAlignmentData, AILearningInsights,
  PlacementProject, ResumeATSAnalysis, InternshipOpportunity, InterviewPerformanceStats, PlacementReadinessData,
  NextBestAction, StudentIntelligenceScores
} from '../types';
import { 
  TrendingUp, Award, Layers, Target, ArrowUpRight, Sparkles, 
  ExternalLink, Calendar, PlusCircle, CheckCircle2, ChevronRight, SlidersHorizontal,
  Wallet, AlertTriangle, AlertOctagon, CheckCircle, GraduationCap, Flame, ShieldCheck, Zap, CheckSquare,
  Briefcase, FileText, Building2, MessageSquare, Bot
} from 'lucide-react';

interface DashboardOverviewProps {
  user: User;
  skills: SkillMetric[];
  historicalScores: HistoricalScore[];
  submissions: ProjectSubmission[];
  roadmapMilestones: RoadmapMilestone[];
  expenses?: ExpenseItem[];
  monthlyBudget?: number;
  detailedSkills?: DetailedSkill[];
  learningGoals?: LearningGoal[];
  streakData?: LearningStreakData;
  careerAlignment?: CareerAlignmentData;
  learningInsights?: AILearningInsights;
  learningRoadmap?: LearningRoadmapMilestone[];
  placementProjects?: PlacementProject[];
  resumeAnalysis?: ResumeATSAnalysis;
  internships?: InternshipOpportunity[];
  interviewStats?: InterviewPerformanceStats;
  placementReadiness?: PlacementReadinessData;
  nba?: NextBestAction;
  intelligenceScores?: StudentIntelligenceScores;
  onNavigateToProjects: () => void;
  onNavigateToEvaluator: (submission?: ProjectSubmission) => void;
  onNavigateToRoadmap: () => void;
  onNavigateToExpenses: () => void;
  onNavigateToLearning: () => void;
  onNavigateToPlacement?: () => void;
  onNavigateToIntelligence?: () => void;
  onOpenCopilot?: () => void;
  onOpenDataEntry: () => void;
  onChangeInterest: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  user,
  skills,
  historicalScores,
  submissions,
  roadmapMilestones,
  expenses = [],
  monthlyBudget = 8000,
  detailedSkills = [],
  learningGoals = [],
  streakData = { currentStreak: 5, longestStreak: 14, totalDays: 24, totalHours: 54, lastActiveDate: '2026-10-04', badges: [] },
  careerAlignment = { score: 82, targetRole: 'Cloud & Infrastructure Engineer', targetRoleBenchmark: 85, strengths: [], skillGaps: [], actionsToImprove: [], roleComparison: [] },
  learningInsights = {
    fastestImprovingSkills: [{ name: 'Distributed Consensus & Raft', growth: '+24% this month' }],
    skillsNeedingAttention: [{ name: 'Kubernetes Cluster Orchestration', reason: 'High priority requirement' }],
    nextRecommendedSkill: { name: 'OpenTelemetry Distributed Tracing', category: 'Cloud', reason: 'High priority', targetMilestone: 'Milestone 4' },
    consistencyScore: 88,
    actionableSuggestions: ['Spend 25 minutes daily solving concurrent programming problems.'],
    learningSummary: 'Strong upward momentum in systems engineering fundamentals.',
  },
  learningRoadmap = [],
  placementProjects = [],
  resumeAnalysis = { overallScore: 86, roleMatchScore: 84, matchedKeywords: [], missingKeywords: [], weakSections: [], projectImprovements: [], actionableFixes: [], analyzedAt: '' },
  internships = [],
  interviewStats = { totalAttempts: 3, averageScore: 86, technicalScore: 88, hrScore: 82, aptitudeScore: 85, accuracy: 86, topicMastery: [] },
  placementReadiness = { overallScore: 85, breakdown: { skillProficiency: 84, projectQuality: 88, resumeStrength: 86, learningProgress: 82, interviewPerformance: 86, aptitudePerformance: 85, careerAlignment: 82 }, status: 'Ready for Top Tech', strengths: [], criticalGaps: [], highestImpactNextActions: [], estimatedTimeframeToReady: '2 - 3 Weeks' },
  nba,
  intelligenceScores = { overallGrowth: 83, careerReadiness: 82, academicProgress: 84, skillProficiency: 78, projectExcellence: 88, financialDiscipline: 92, placementReadiness: 85, trends: { overallGrowthTrend: 'increasing', growthDelta: 8, weeklyHoursDelta: 6.5, readinessDelta: 5 } },
  onNavigateToProjects,
  onNavigateToEvaluator,
  onNavigateToRoadmap,
  onNavigateToExpenses,
  onNavigateToLearning,
  onNavigateToPlacement,
  onNavigateToIntelligence,
  onOpenCopilot,
  onOpenDataEntry,
  onChangeInterest,
}) => {
  const [selectedScoreIndex, setSelectedScoreIndex] = useState<number>(
    historicalScores.length - 1
  );

  const latestScore = historicalScores[historicalScores.length - 1] || {
    score: 84,
    technicalComplexity: 21,
    industryRelevance: 22,
    codeArchitectureQuality: 20,
    innovationAndImpact: 21,
  };

  const selectedPoint = historicalScores[selectedScoreIndex] || latestScore;

  // Expense Calculations for Dashboard Overview
  const totalSpent = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const remainingBudget = Math.max(0, monthlyBudget - totalSpent);
  const percentageUsed = monthlyBudget > 0 ? Math.round((totalSpent / monthlyBudget) * 100) : 0;
  const academicTotal = expenses
    .filter((e) => e.category === 'Education' || e.category === 'Projects')
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const budgetStatus: 'Normal' | 'Warning' | 'Critical' =
    percentageUsed >= 90 ? 'Critical' : percentageUsed >= 70 ? 'Warning' : 'Normal';

  // Calculate Roadmap completion
  const totalTasks = roadmapMilestones.reduce((acc, m) => acc + m.tasks.length, 0);
  const completedTasks = roadmapMilestones.reduce(
    (acc, m) => acc + m.tasks.filter((t) => t.done).length,
    0
  );
  const roadmapPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 40;

  // Latest evaluation submission
  const latestSubmission = submissions[submissions.length - 1];

  // SVG Chart Geometry for Historical Performance
  const chartWidth = 560;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 30;

  const minScore = 60;
  const maxScore = 100;

  const points = historicalScores.map((item, index) => {
    const x =
      historicalScores.length > 1
        ? paddingX + (index / (historicalScores.length - 1)) * (chartWidth - paddingX * 2)
        : chartWidth / 2;
    const y =
      chartHeight -
      paddingY -
      ((item.score - minScore) / (maxScore - minScore)) * (chartHeight - paddingY * 2);
    return { x, y, ...item };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  // Radar Chart data for skills
  const radarCategories = [
    { label: 'System Design', value: 85 },
    { label: 'Algorithmic Rigor', value: 88 },
    { label: 'Domain Tooling', value: 78 },
    { label: 'Architecture', value: 86 },
    { label: 'Testing & Security', value: 75 },
  ];

  const radarRadius = 75;
  const radarCenter = { x: 120, y: 110 };
  const totalAngles = radarCategories.length;

  const getCoordinates = (index: number, val: number) => {
    const angle = (Math.PI * 2 / totalAngles) * index - Math.PI / 2;
    const r = (val / 100) * radarRadius;
    return {
      x: radarCenter.x + r * Math.cos(angle),
      y: radarCenter.y + r * Math.sin(angle),
    };
  };

  const radarPath = radarCategories.map((c, i) => {
    const pt = getCoordinates(i, c.value);
    return `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
  }).join(' ') + ' Z';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Welcome & Status Hero Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center font-bold text-lg border border-slate-800 shadow-xs shrink-0 tracking-tight">
              <span>{user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'ST'}</span>
              <span className="text-[9px] font-mono text-emerald-400 font-normal">STUDENT</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {user.name}
                </h1>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  {user.year}
                </span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-slate-600">
                  {user.department}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                <div className="flex items-center gap-1.5 font-medium text-slate-900">
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Domain Focus: {user.interest || 'Systems Architecture'}</span>
                </div>
                <span className="text-slate-300">|</span>
                <button
                  onClick={onChangeInterest}
                  className="text-slate-500 hover:text-slate-900 hover:underline transition-colors"
                >
                  Change Focus
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            <button
              onClick={() => onNavigateToEvaluator()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Evaluate Project with AI</span>
            </button>

            <button
              onClick={onOpenDataEntry}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Basic Data Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Phase 5: The ONE Next Best Action Banner */}
      {nba && (
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-slate-700/60 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  <Target className="w-3.5 h-3.5" />
                  The ONE Next Best Action
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {nba.category} · Priority: <strong className="text-emerald-300">{nba.urgency}</strong>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  (~{nba.estimatedMinutes} mins)
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                {nba.title}
              </h2>
              <p className="text-xs text-slate-200 leading-relaxed">
                <strong>What:</strong> {nba.what}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-1 text-xs">
                <div className="text-slate-300">
                  <strong className="text-emerald-300">Why:</strong> {nba.why}
                </div>
                <div className="text-slate-300">
                  <strong className="text-emerald-300">Expected Benefit:</strong> {nba.benefit}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 self-start md:self-center">
              <button
                onClick={() => {
                  if (nba.targetTab === 'placement' && onNavigateToPlacement) onNavigateToPlacement();
                  else if (nba.targetTab === 'learning') onNavigateToLearning();
                  else if (nba.targetTab === 'expenses') onNavigateToExpenses();
                  else if (onNavigateToIntelligence) onNavigateToIntelligence();
                }}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-sm whitespace-nowrap"
              >
                <span>Execute Action</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              {onOpenCopilot && (
                <button
                  onClick={onOpenCopilot}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/20 transition-colors whitespace-nowrap"
                >
                  <Bot className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Ask Copilot</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Level Metric Cards (Anti-Slop, No Pills, Tabular Figures) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
            <span>AI Academic Readiness</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {latestScore.score}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+6 points since last evaluation</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
            <span>Verified Skills</span>
            <Layers className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {skills.length}
            </span>
            <span className="text-xs text-slate-400">Competencies</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            High focus in {user.interest.split('&')[0]}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
            <span>Evaluated Projects</span>
            <ExternalLink className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {submissions.length}
            </span>
            <span className="text-xs text-slate-400">Submissions</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            All scored with actionable rubrics
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
            <span>Career Roadmap Progress</span>
            <Target className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {roadmapPercent}%
            </span>
            <span className="text-xs text-slate-400">
              ({completedTasks}/{totalTasks} milestones)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2.5">
            <div
              className="bg-slate-900 h-full rounded-full transition-all duration-500"
              style={{ width: `${roadmapPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Phase 2: My Expenses & Budget Spotlight Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 shrink-0">
              <Wallet className="w-5 h-5 text-slate-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Smart Student Expenses & Budget Monitor
                </h3>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                    budgetStatus === 'Critical'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : budgetStatus === 'Warning'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {budgetStatus === 'Critical' ? (
                    <AlertOctagon className="w-3 h-3 text-rose-600" />
                  ) : budgetStatus === 'Warning' ? (
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                  ) : (
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                  )}
                  <span>{budgetStatus} Budget Status</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly Budget: <span className="font-semibold text-slate-800 font-mono">₹{monthlyBudget.toLocaleString()}</span>
                {' · '}
                Total Spent: <span className="font-semibold text-slate-900 font-mono">₹{totalSpent.toLocaleString()}</span>
                {' · '}
                Remaining: <span className="font-semibold text-slate-800 font-mono">₹{remainingBudget.toLocaleString()}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToExpenses}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap self-start md:self-center shadow-xs"
          >
            <span>Open My Expenses Tracker</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Budget Progress Bar */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">Budget Utilization</span>
              <span className="font-bold text-slate-900 font-mono">{percentageUsed}% used</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetStatus === 'Critical'
                    ? 'bg-rose-500'
                    : budgetStatus === 'Warning'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, percentageUsed)}%` }}
              />
            </div>
          </div>

          <div className="md:col-span-4 bg-slate-50 p-2.5 rounded-lg text-xs flex items-center justify-between border border-slate-100">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Education & Projects
              </div>
              <div className="font-bold text-slate-900 font-mono">
                ₹{academicTotal.toLocaleString()}
              </div>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded font-medium">
              Career Investment
            </span>
          </div>
        </div>
      </div>

      {/* Phase 3: AI Learning Hub & Dynamic Skill Acquisition Spotlight */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
              <GraduationCap className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  AI Learning Hub & Dynamic Skill Acquisition
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Target className="w-3 h-3 text-emerald-600" />
                  <span>Target: {careerAlignment.targetRole}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  <Flame className="w-3 h-3 text-amber-600 fill-amber-600" />
                  <span>{streakData.currentStreak}-Day Streak</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Dynamic skill categorization, milestone roadmaps, daily practice streaks, and competency alignment against industry expectations.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToLearning}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap self-start md:self-center shadow-xs"
          >
            <span>Open AI Learning Hub</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Phase 3 KPI Quick Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Career Alignment */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Career Alignment Score</span>
              <Target className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1.5 my-0.5">
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {careerAlignment.score}
              </span>
              <span className="text-xs text-slate-500 font-mono">/ 100</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100/60 font-semibold px-1.5 py-0.5 rounded ml-auto">
                Goal: {careerAlignment.targetRoleBenchmark}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-emerald-600 h-full rounded-full" 
                style={{ width: `${careerAlignment.score}%` }} 
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1.5">
              {careerAlignment.skillGaps.length} skill gaps identified to close
            </div>
          </div>

          {/* Card 2: Learning Streak */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Learning Habit Momentum</span>
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </div>
            <div className="flex items-baseline gap-1.5 my-0.5">
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {streakData.currentStreak}
              </span>
              <span className="text-xs text-slate-500">Days Active</span>
              <span className="text-[10px] text-amber-700 bg-amber-100/60 font-semibold px-1.5 py-0.5 rounded ml-auto">
                {streakData.totalHours} hrs total
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
              <span>Best: {streakData.longestStreak} days</span>
              <span className="font-mono">{streakData.totalDays} sessions</span>
            </div>
          </div>

          {/* Card 3: Skills Tracked */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Technical & Soft Skills</span>
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-1.5 my-0.5">
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {detailedSkills.length || skills.length}
              </span>
              <span className="text-xs text-slate-500">Active Skills</span>
              <span className="text-[10px] text-indigo-700 bg-indigo-100/60 font-semibold px-1.5 py-0.5 rounded ml-auto">
                {detailedSkills.filter((s) => s.status === 'Completed').length} Done
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
              <span>{detailedSkills.filter((s) => s.type === 'Technical').length} Technical</span>
              <span>{detailedSkills.filter((s) => s.type === 'Soft').length} Soft Skills</span>
            </div>
          </div>

          {/* Card 4: Learning Goals */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Learning Goals & Milestones</span>
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1.5 my-0.5">
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {learningGoals.filter((g) => g.completed).length} / {learningGoals.length}
              </span>
              <span className="text-xs text-slate-500">Goals Completed</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-slate-900 h-full rounded-full" 
                style={{ 
                  width: `${learningGoals.length > 0 ? (learningGoals.filter((g) => g.completed).length / learningGoals.length) * 100 : 60}%` 
                }} 
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1.5">
              {learningGoals.filter((g) => !g.completed && g.timeframe === 'Daily').length} daily goals pending today
            </div>
          </div>
        </div>

        {/* AI Insight Teaser Bar */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-3 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold text-slate-900">AI Next Recommendation:</span>
            <span className="text-slate-700">
              Master <span className="font-semibold text-slate-900">{learningInsights.nextRecommendedSkill?.name || 'OpenTelemetry Distributed Tracing'}</span> ({learningInsights.nextRecommendedSkill?.category || 'Cloud'})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Consistency Score: <strong className="text-slate-800 font-mono">{learningInsights.consistencyScore}%</strong>
            </span>
            <button
              onClick={onNavigateToLearning}
              className="text-xs font-semibold text-slate-900 hover:text-emerald-700 flex items-center gap-1 transition-colors"
            >
              <span>Explore All Skill Gaps</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Phase 4: AI Career & Placement Hub Spotlight */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Briefcase className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  AI Career & Placement Hub
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Award className="w-3 h-3 text-emerald-600" />
                  <span>Readiness: {placementReadiness.overallScore}% ({placementReadiness.status})</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                  <Building2 className="w-3 h-3 text-slate-600" />
                  <span>{internships.length} Matched Internships</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Convert verified project evaluations, learning roadmaps, and career alignments into measurable placement readiness, ATS-scanned resumes, and mock interview practice.
              </p>
            </div>
          </div>

          {onNavigateToPlacement && (
            <button
              onClick={onNavigateToPlacement}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap self-start md:self-center shadow-xs"
            >
              <span>Open Placement Hub</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Phase 4 Quick Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Placement Index</span>
              <Award className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1.5 my-0.5">
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {placementReadiness.overallScore}%
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100/60 font-semibold px-1.5 py-0.5 rounded ml-auto">
                {placementReadiness.status}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${placementReadiness.overallScore}%` }} />
            </div>
            <div className="text-[10px] text-slate-500 mt-1.5">
              {placementReadiness.estimatedTimeframeToReady}
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Placement Projects & Proof</span>
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-1.5 my-0.5">
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {placementProjects.filter((p) => p.status === 'Completed').length}
              </span>
              <span className="text-xs text-slate-500">/ {placementProjects.length} Completed</span>
              <span className="text-[10px] text-indigo-700 bg-indigo-100/60 font-semibold px-1.5 py-0.5 rounded ml-auto">
                {placementProjects.filter((p) => p.inPortfolio).length} in Portfolio
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
              <span>Evaluated Artifacts</span>
              <span className="font-semibold text-slate-700">100% Truthful Code</span>
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">ATS Resume Match</span>
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1.5 my-0.5">
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {resumeAnalysis.overallScore}
              </span>
              <span className="text-xs text-slate-500">/ 100 ATS Score</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100/60 font-semibold px-1.5 py-0.5 rounded ml-auto">
                {resumeAnalysis.matchedKeywords.length} Keywords
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
              <span>Role Match: {resumeAnalysis.roleMatchScore}%</span>
              <span className="font-semibold text-rose-700">{resumeAnalysis.missingKeywords.length} gaps</span>
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium">Interview Mock Rounds</span>
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-1.5 my-0.5">
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {interviewStats.averageScore}%
              </span>
              <span className="text-xs text-slate-500">Avg Score</span>
              <span className="text-[10px] text-amber-700 bg-amber-100/60 font-semibold px-1.5 py-0.5 rounded ml-auto">
                {interviewStats.totalAttempts} Done
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
              <span>Technical: {interviewStats.technicalScore}%</span>
              <span>HR: {interviewStats.hrScore}%</span>
            </div>
          </div>
        </div>

        {/* Placement Action Teaser */}
        {placementReadiness.highestImpactNextActions[0] && (
          <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-3 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="font-bold text-slate-900">Highest-Impact Placement Action:</span>
              <span className="text-slate-700">{placementReadiness.highestImpactNextActions[0]}</span>
            </div>

            {onNavigateToPlacement && (
              <button
                onClick={onNavigateToPlacement}
                className="text-xs font-semibold text-slate-900 hover:text-emerald-700 flex items-center gap-1 transition-colors whitespace-nowrap"
              >
                <span>View All Actions & Internships</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Phase 5: Student Intelligence & AI Career Copilot Spotlight */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  AI Career Copilot & Complete Student Intelligence
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <span>Overall Growth: {intelligenceScores.overallGrowth}%</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                  <ShieldCheck className="w-3 h-3 text-indigo-600" />
                  <span>7 Deterministic Scores Active</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Centralized intelligence engine connecting transcripts, evaluated projects, ATS scans, mock interviews, and budget discipline with transparent deterministic formulas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-center">
            {onOpenCopilot && (
              <button
                onClick={onOpenCopilot}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              >
                <Bot className="w-3.5 h-3.5 text-emerald-600" />
                <span>Chat with Copilot</span>
              </button>
            )}

            {onNavigateToIntelligence && (
              <button
                onClick={onNavigateToIntelligence}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
              >
                <span>View Full Intelligence</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 4 Score Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
            <div className="text-[11px] font-medium text-slate-500 mb-1">Overall Student Growth</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900 font-mono">{intelligenceScores.overallGrowth}%</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-semibold">+{intelligenceScores.trends.growthDelta}% Trend</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-slate-900 h-full rounded-full" style={{ width: `${intelligenceScores.overallGrowth}%` }} />
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
            <div className="text-[11px] font-medium text-slate-500 mb-1">Career Readiness</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900 font-mono">{intelligenceScores.careerReadiness}%</span>
              <span className="text-[10px] text-slate-500">Benchmark: 85%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${intelligenceScores.careerReadiness}%` }} />
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
            <div className="text-[11px] font-medium text-slate-500 mb-1">Project & Code Excellence</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900 font-mono">{intelligenceScores.projectExcellence}%</span>
              <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-semibold">Verified Proof</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${intelligenceScores.projectExcellence}%` }} />
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5">
            <div className="text-[11px] font-medium text-slate-500 mb-1">Financial Discipline</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900 font-mono">{intelligenceScores.financialDiscipline}%</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-semibold">Budget Sound</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${intelligenceScores.financialDiscipline}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Historical Performance Progression Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Historical Performance & Growth Metrics
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  AI rubric scores tracked across evaluated project submissions
                </p>
              </div>
              <div className="text-xs text-slate-500">
                Selected:{' '}
                <span className="font-semibold text-slate-900">{selectedPoint.date}</span>
                {' · '}
                <span className="font-bold text-emerald-600 tabular-nums">{selectedPoint.score}/100</span>
              </div>
            </div>

            {/* Interactive SVG Line Graph */}
            <div className="relative w-full overflow-x-auto py-2">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-44 select-none"
              >
                {/* Gridlines */}
                {[60, 70, 80, 90, 100].map((gridVal) => {
                  const y =
                    chartHeight -
                    paddingY -
                    ((gridVal - minScore) / (maxScore - minScore)) * (chartHeight - paddingY * 2);
                  return (
                    <g key={gridVal}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 3}
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="end"
                        className="tabular-nums"
                      >
                        {gridVal}
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Area */}
                {areaD && (
                  <path
                    d={areaD}
                    fill="url(#scoreGradient)"
                    opacity="0.25"
                  />
                )}

                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Score Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Points */}
                {points.map((pt, i) => {
                  const isSelected = selectedScoreIndex === i;
                  return (
                    <g
                      key={i}
                      className="cursor-pointer"
                      onClick={() => setSelectedScoreIndex(i)}
                    >
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isSelected ? '6' : '4'}
                        fill={isSelected ? '#10b981' : '#0f172a'}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all hover:r-6"
                      />
                      <text
                        x={pt.x}
                        y={chartHeight - 8}
                        fill={isSelected ? '#0f172a' : '#64748b'}
                        fontSize="10"
                        fontWeight={isSelected ? '600' : '400'}
                        textAnchor="middle"
                      >
                        {pt.date}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Selected Point Breakdown Bar */}
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg text-xs">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Complexity</div>
              <div className="text-slate-900 font-bold tabular-nums">
                {selectedPoint.technicalComplexity} / 25
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Industry Fit</div>
              <div className="text-slate-900 font-bold tabular-nums">
                {selectedPoint.industryRelevance} / 25
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Architecture</div>
              <div className="text-slate-900 font-bold tabular-nums">
                {selectedPoint.codeArchitectureQuality} / 25
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Innovation</div>
              <div className="text-slate-900 font-bold tabular-nums">
                {selectedPoint.innovationAndImpact} / 25
              </div>
            </div>
          </div>
        </div>

        {/* Skill Radar / Acquisition Distribution Chart */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900">
                Skill Acquisition Map
              </h2>
              <span className="text-[11px] text-slate-500">Domain Benchmark</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Competencies relative to industry expectations
            </p>

            {/* Radar SVG */}
            <div className="flex justify-center items-center py-1">
              <svg viewBox="0 0 240 220" className="w-52 h-48 select-none">
                {/* Concentric rings */}
                {[0.25, 0.5, 0.75, 1.0].map((scale, sIdx) => {
                  const r = radarRadius * scale;
                  return (
                    <polygon
                      key={sIdx}
                      points={radarCategories
                        .map((_, i) => {
                          const angle = (Math.PI * 2 / totalAngles) * i - Math.PI / 2;
                          return `${radarCenter.x + r * Math.cos(angle)},${radarCenter.y + r * Math.sin(angle)}`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Spoke lines */}
                {radarCategories.map((_, i) => {
                  const angle = (Math.PI * 2 / totalAngles) * i - Math.PI / 2;
                  const x2 = radarCenter.x + radarRadius * Math.cos(angle);
                  const y2 = radarCenter.y + radarRadius * Math.sin(angle);
                  return (
                    <line
                      key={i}
                      x1={radarCenter.x}
                      y1={radarCenter.y}
                      x2={x2}
                      y2={y2}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Filled radar polygon */}
                <polygon
                  points={radarCategories
                    .map((c, i) => {
                      const pt = getCoordinates(i, c.value);
                      return `${pt.x},${pt.y}`;
                    })
                    .join(' ')}
                  fill="#0f172a"
                  fillOpacity="0.15"
                  stroke="#0f172a"
                  strokeWidth="2"
                />

                {/* Labels */}
                {radarCategories.map((cat, i) => {
                  const angle = (Math.PI * 2 / totalAngles) * i - Math.PI / 2;
                  const lx = radarCenter.x + (radarRadius + 18) * Math.cos(angle);
                  const ly = radarCenter.y + (radarRadius + 14) * Math.sin(angle);
                  return (
                    <text
                      key={i}
                      x={lx}
                      y={ly}
                      fontSize="9"
                      fill="#475569"
                      fontWeight="500"
                      textAnchor="middle"
                    >
                      {cat.label}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Average Verification:</span>
            <span className="font-bold text-slate-900 tabular-nums">82.6% Industry Alignment</span>
          </div>
        </div>
      </div>

      {/* Latest Evaluation & Actionable AI Feedback Spotlight */}
      {latestSubmission?.evaluation && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span>Latest AI Evaluation</span>
                <span>·</span>
                <span className="font-mono">{latestSubmission.submittedAt}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">
                {latestSubmission.title}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-500">Evaluation Score</div>
                <div className="text-xl font-bold text-slate-900 tabular-nums">
                  {latestSubmission.evaluation.overallScore} / 100
                </div>
              </div>
              <button
                onClick={() => onNavigateToEvaluator(latestSubmission)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                View Full Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Strengths</span>
              </h4>
              <ul className="space-y-1.5 text-slate-600">
                {latestSubmission.evaluation.strengths.slice(0, 3).map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-600" />
                <span>Actionable Areas for Academic Improvement</span>
              </h4>
              <ul className="space-y-1.5 text-slate-600">
                {latestSubmission.evaluation.areasForImprovement.slice(0, 3).map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Roadmap Quick Link & Project Suggestions Teaser */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Suggested Projects in {user.interest || 'Your Domain'}
              </h3>
              <button
                onClick={onNavigateToProjects}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
              >
                <span>Browse All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Explore hands-on project ideas tailored to your department and academic year, designed to challenge you and produce strong portfolio artifacts.
            </p>
          </div>

          <button
            onClick={onNavigateToProjects}
            className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>Explore 3 Curated Project Ideas</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Detailed Career Roadmap
              </h3>
              <button
                onClick={onNavigateToRoadmap}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
              >
                <span>View Full Roadmap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Step-by-step milestone progression for {user.year}, from systems programming foundations through production observability and interview prep.
            </p>
          </div>

          <button
            onClick={onNavigateToRoadmap}
            className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>Track Career Milestones ({roadmapPercent}% done)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
