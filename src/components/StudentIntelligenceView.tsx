import React, { useState } from 'react';
import { 
  Bot, Sparkles, Target, ArrowUpRight, TrendingUp, Award, 
  ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, ChevronRight, 
  Layers, FileText, Briefcase, GraduationCap, Wallet, Zap, Calendar, 
  Clock, CheckSquare, RefreshCw, Bell, Filter, Download, BookOpen, 
  Flame, CheckCircle, ExternalLink, ArrowRight, X
} from 'lucide-react';
import { 
  User, UnifiedStudentContext, StudentIntelligenceScores, 
  StudentIntelligenceInsight, NextBestAction, WeeklyStudentReport, 
  SmartNotification 
} from '../types';
import { StudentAchievementBadge } from '../services/intelligenceService';
import { saveWeeklyReportDB } from '../services/api';

interface StudentIntelligenceViewProps {
  user: User;
  context: UnifiedStudentContext;
  scores: StudentIntelligenceScores;
  insights: StudentIntelligenceInsight[];
  nba: NextBestAction;
  achievements: StudentAchievementBadge[];
  weeklyReport: WeeklyStudentReport;
  notifications: SmartNotification[];
  onOpenCopilot: () => void;
  onNavigateTab: (tab: string) => void;
  onRefreshIntelligence: () => void;
  onToggleNotificationRead?: (notifId: string) => void;
}

export const StudentIntelligenceView: React.FC<StudentIntelligenceViewProps> = ({
  user,
  context,
  scores,
  insights,
  nba,
  achievements,
  weeklyReport,
  notifications,
  onOpenCopilot,
  onNavigateTab,
  onRefreshIntelligence,
  onToggleNotificationRead,
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');
  const [showWeeklyReportModal, setShowWeeklyReportModal] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [notificationList, setNotificationList] = useState<SmartNotification[]>(notifications);
  const [notifPreferences, setNotifPreferences] = useState({
    goalDeadlines: true,
    delayedMilestones: true,
    internshipDeadlines: true,
    budgetAlerts: true,
    copilotTips: true,
  });

  const categories = [
    'All',
    'Academics',
    'Skills & Learning',
    'Projects & Portfolio',
    'Resume & Placement',
    'Finances & Budget',
    'Habits & Streaks',
  ];

  const types = ['All', 'strength', 'weakness', 'risk', 'opportunity'];

  const filteredInsights = insights.filter((item) => {
    const matchesCat = selectedCategoryFilter === 'All' || item.category === selectedCategoryFilter;
    const matchesType = selectedTypeFilter === 'All' || item.type === selectedTypeFilter;
    return matchesCat && matchesType;
  });

  const unreadCount = notificationList.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotificationList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (onToggleNotificationRead) {
      onToggleNotificationRead(id);
    }
  };

  const handleMarkAllRead = () => {
    setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Radar/Polygon Score Geometry
  const scoreMetrics = [
    { label: 'Overall Growth', value: scores.overallGrowth, weight: 'Composite' },
    { label: 'Career Readiness', value: scores.careerReadiness, weight: '15%' },
    { label: 'Academic Progress', value: scores.academicProgress, weight: '20%' },
    { label: 'Skill Proficiency', value: scores.skillProficiency, weight: '20%' },
    { label: 'Project Excellence', value: scores.projectExcellence, weight: '20%' },
    { label: 'Financial Discipline', value: scores.financialDiscipline, weight: '10%' },
    { label: 'Placement Readiness', value: scores.placementReadiness, weight: '15%' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-150">
      {/* Hero: Student Intelligence Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center font-bold text-lg border border-slate-800 shadow-xs shrink-0 tracking-tight">
              <Bot className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  Phase 5: Student Intelligence
                </span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  {user.year} · {user.department}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                AI Career Copilot & Complete Student Intelligence
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                One centralized intelligence layer connecting academic transcripts, code evaluations, ATS resume scans, mock interviews, and budget discipline for <strong className="text-slate-900">{context.placement.targetRole}</strong>.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={() => setShowNotificationsDrawer(true)}
              className="relative p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setShowWeeklyReportModal(true);
                saveWeeklyReportDB(weeklyReport).catch(() => {});
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Weekly Report</span>
            </button>

            <button
              onClick={onOpenCopilot}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ask Career Copilot</span>
            </button>
          </div>
        </div>

        {/* Quick Context Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-500">Overall Growth</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-slate-900 font-mono">{scores.overallGrowth}%</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded font-medium">+{scores.trends.growthDelta}% trend</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-500">Placement Readiness</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-emerald-700 font-mono">{scores.placementReadiness}%</span>
              <span className="text-[10px] text-slate-600">({context.placement.readiness.status})</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-500">ATS Resume Match</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-slate-900 font-mono">{context.resume.atsScore}/100</span>
              <span className="text-[10px] text-slate-600">({context.resume.missingKeywordsCount} gaps)</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-500">Active Habit Streak</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-slate-900 font-mono">{context.learning.streak.currentStreak} Days</span>
              <span className="text-[10px] text-amber-700 font-medium">({context.learning.streak.totalHours} hrs)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* The ONE Next Best Action Banner (Core Phase 5 Goal)     */}
      {/* ======================================================== */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Zap className="w-64 h-64 text-emerald-400" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                <Target className="w-3.5 h-3.5" />
                The ONE Next Best Action
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Category: <strong>{nba.category}</strong> · Urgency: <strong className="text-emerald-300">{nba.urgency}</strong>
              </span>
            </div>

            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Est. time: ~{nba.estimatedMinutes} mins
            </span>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-2">
              {nba.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl">
              <strong>What:</strong> {nba.what}
            </p>
          </div>

          {/* Transparent Reason & Expected Benefit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
              <div className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Evidence & Why This Is Prioritized:
              </div>
              <p className="text-slate-200 leading-normal">
                {nba.why}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10">
              <div className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Expected Quantifiable Benefit:
              </div>
              <p className="text-slate-200 leading-normal">
                {nba.benefit}
              </p>
            </div>
          </div>

          {/* Deep link button */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab(nba.targetTab)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
            >
              <span>Execute This Action Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenCopilot}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/20 transition-colors"
            >
              <Bot className="w-4 h-4 text-emerald-300" />
              <span>Ask Copilot for Step-by-Step Guidance</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* Deterministic Scores & Trend Breakdown Matrix           */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Deterministic Student Intelligence Scores
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparent, non-comparative scores computed strictly from verified code submissions, ATS scans, practice logs, and budget habits.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Last calculated:</span>
            <span className="font-mono text-slate-700 font-medium">Just now</span>
            <button
              onClick={onRefreshIntelligence}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
              title="Recalculate Scores"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 7 Core Scores Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scoreMetrics.map((metric, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${
                idx === 0
                  ? 'bg-slate-900 text-white border-slate-800'
                  : 'bg-slate-50/70 border-slate-200/80 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={idx === 0 ? 'text-slate-300 font-medium' : 'text-slate-500 font-medium'}>
                  {metric.label}
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  idx === 0 ? 'bg-slate-800 text-emerald-400' : 'bg-slate-200 text-slate-700'
                }`}>
                  {metric.weight}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 my-1">
                <span className={`text-2xl font-extrabold font-mono ${
                  idx === 0 ? 'text-white' : 'text-slate-900'
                }`}>
                  {metric.value}%
                </span>
                <span className={`text-xs ${idx === 0 ? 'text-slate-400' : 'text-slate-500'}`}>
                  / 100
                </span>
              </div>

              <div className="w-full bg-slate-200/50 h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full rounded-full ${
                    idx === 0 ? 'bg-emerald-400' : 'bg-slate-900'
                  }`}
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Transparent Formula Disclosure */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="font-semibold text-slate-800">Overall Growth Formula:</span>
            <p className="font-mono text-[11px] text-slate-700">
              Overall Growth = (Academic × 20%) + (Skills × 20%) + (Projects × 20%) + (Placement × 15%) + (Career Alignment × 15%) + (Finances × 10%)
            </p>
          </div>
          <span className="text-[11px] text-emerald-700 bg-emerald-100/60 font-medium px-2.5 py-1 rounded-md shrink-0">
            100% Deterministic & Auditable
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* AI Intelligence Insights (Strengths, Weaknesses, Gaps)   */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Student Intelligence Insights</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                {filteredInsights.length} Active
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuous gap detection across project code quality, resume keywords, interview mastery, and budget consistency.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 capitalize"
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Types' : t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInsights.map((insight) => {
            const isStrength = insight.type === 'strength';
            const isRisk = insight.type === 'risk' || insight.urgency === 'critical';
            const isOpportunity = insight.type === 'opportunity';

            const badgeBg = isStrength
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : isRisk
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : isOpportunity
              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
              : 'bg-amber-50 text-amber-800 border-amber-200';

            return (
              <div
                key={insight.id}
                className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-3.5 hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {insight.category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeBg}`}>
                      {insight.type} · {insight.urgency}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {insight.issue}
                  </p>
                </div>

                <div className="space-y-2 text-xs pt-2 border-t border-slate-200/60">
                  <div className="bg-white p-2 rounded border border-slate-200/80">
                    <span className="font-semibold text-slate-800">Evidence: </span>
                    <span className="text-slate-600 font-mono text-[11px]">{insight.evidence}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Action: </span>
                    <span className="text-slate-700">{insight.action}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-700">Expected Benefit: </span>
                    <span className="text-emerald-800 font-medium">{insight.benefit}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* Real Milestone Achievements & Badges Gallery (No Fake)  */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Real Milestone Achievements & Badges</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono">
                {achievements.filter((a) => a.achieved).length} Earned
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Badges unlocked strictly upon reaching verified code quality, habit streaks, ATS resume benchmarks, and financial discipline milestones. Never fabricated.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                badge.achieved
                  ? 'bg-slate-50 border-slate-200 shadow-2xs'
                  : 'bg-white border-dashed border-slate-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {badge.category}
                  </span>
                  {badge.achieved ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                      <CheckCircle className="w-3 h-3" />
                      Earned
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">
                      {badge.progress}%
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-900 mb-1">
                  {badge.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal mb-3">
                  {badge.description}
                </p>
              </div>

              <div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full ${badge.achieved ? 'bg-emerald-600' : 'bg-slate-400'}`}
                    style={{ width: `${badge.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-600">
                  <span className="font-mono font-medium">{badge.metricLabel}</span>
                  {badge.unlockedDate && (
                    <span className="text-slate-500">{badge.unlockedDate}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* Weekly Student Report Modal                              */}
      {/* ======================================================== */}
      {showWeeklyReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">Student Intelligence Weekly Report</h3>
                  <p className="text-[11px] text-slate-300 font-mono">{weeklyReport.weekOf}</p>
                </div>
              </div>
              <button
                onClick={() => setShowWeeklyReportModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700 leading-relaxed">
              {/* Executive Summary */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Executive Summary
                </h4>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed">
                  {weeklyReport.executiveSummary}
                </div>
              </div>

              {/* Key Achievements */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  Key Achievements This Week
                </h4>
                <ul className="space-y-2">
                  {weeklyReport.keyAchievements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 p-2 bg-emerald-50/50 border border-emerald-100 rounded-lg text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Learning & Skills / Projects / Finances Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="font-bold text-slate-900 block">Learning & Skills Summary</span>
                  <div><strong>Study Hours:</strong> {weeklyReport.learningAndSkillsSummary.hoursStudied} hrs logged</div>
                  <div><strong>Streak:</strong> {weeklyReport.learningAndSkillsSummary.streakDays} consecutive days</div>
                  <div><strong>Advanced Skills:</strong></div>
                  <ul className="list-disc list-inside text-slate-600 pl-1">
                    {weeklyReport.learningAndSkillsSummary.skillsAdvanced.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="font-bold text-slate-900 block">Placement & Finance Summary</span>
                  <div><strong>ATS Resume Score:</strong> {weeklyReport.projectsAndPlacementSummary.resumeScore}/100</div>
                  <div><strong>Mock Interviews:</strong> {weeklyReport.projectsAndPlacementSummary.interviewsAttempted} rounds attempted</div>
                  <div><strong>Budget Status:</strong> {weeklyReport.financialDisciplineSummary.status}</div>
                  <div><strong>Academic Investment:</strong> ₹{weeklyReport.financialDisciplineSummary.academicInvestment.toLocaleString()}</div>
                </div>
              </div>

              {/* Critical Weaknesses & Risks */}
              <div>
                <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Critical Weaknesses & Identified Risks
                </h4>
                <ul className="space-y-1.5">
                  {weeklyReport.criticalWeaknessesAndRisks.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-900">
                      <span className="font-bold text-rose-700">!</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Week Priorities */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  Target Priorities for Next Week
                </h4>
                <ol className="space-y-1.5 list-decimal list-inside bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800">
                  {weeklyReport.nextWeekPriorities.map((p, idx) => (
                    <li key={idx} className="font-medium">{p}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-500">
                Generated at {new Date(weeklyReport.generatedAt).toLocaleString()} · Backend-ready
              </span>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Smart Configurable Notifications Drawer                  */}
      {/* ======================================================== */}
      {showNotificationsDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
            <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Smart Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-rose-600 px-1.5 py-0.5 rounded-full font-bold">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-slate-300 hover:text-white underline"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotificationsDrawer(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification Preferences Toggle strip */}
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs">
              <div className="font-semibold text-slate-700 mb-1.5">Notification Types Enabled:</div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifPreferences.goalDeadlines}
                    onChange={(e) => setNotifPreferences({ ...notifPreferences, goalDeadlines: e.target.checked })}
                    className="rounded text-slate-900"
                  />
                  <span>Goal Deadlines</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifPreferences.internshipDeadlines}
                    onChange={(e) => setNotifPreferences({ ...notifPreferences, internshipDeadlines: e.target.checked })}
                    className="rounded text-slate-900"
                  />
                  <span>Internships</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifPreferences.budgetAlerts}
                    onChange={(e) => setNotifPreferences({ ...notifPreferences, budgetAlerts: e.target.checked })}
                    className="rounded text-slate-900"
                  />
                  <span>Budget</span>
                </label>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notificationList.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No notifications at this time.
                </div>
              ) : (
                notificationList.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      handleMarkAsRead(notif.id);
                      if (notif.targetTab) {
                        onNavigateTab(notif.targetTab);
                        setShowNotificationsDrawer(false);
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      notif.read
                        ? 'bg-white border-slate-200 text-slate-600'
                        : 'bg-emerald-50/40 border-emerald-200 text-slate-900 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />}
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{notif.timestamp}</span>
                    </div>
                    <p className="text-slate-600 leading-normal mt-1">
                      {notif.message}
                    </p>
                    {notif.targetTab && (
                      <div className="mt-2 text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <span>Click to view in {notif.targetTab} tab</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
