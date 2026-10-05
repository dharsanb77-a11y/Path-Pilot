import React, { useState, useEffect } from 'react';
import { User, ExpenseItem, ExpenseCategory, SpendingAnalysisResponse, BudgetAlertLevel } from '../types';
import { requestExpenseAnalysis } from '../services/api';
import { 
  Wallet, Plus, Trash2, Sparkles, AlertTriangle, AlertOctagon, 
  CheckCircle2, TrendingUp, BookOpen, Layers, Search, 
  Calendar, RefreshCw, ArrowUpRight, DollarSign, Filter, Info
} from 'lucide-react';

interface ExpensesTrackerViewProps {
  user: User;
  expenses: ExpenseItem[];
  monthlyBudget: number;
  onUpdateBudget: (budget: number) => void;
  onAddExpense: (expense: ExpenseItem) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const ExpensesTrackerView: React.FC<ExpensesTrackerViewProps> = ({
  user,
  expenses,
  monthlyBudget,
  onUpdateBudget,
  onAddExpense,
  onDeleteExpense,
}) => {
  // Budget configuration state (Prompt: "On first use, ask the student to set a monthly budget")
  const [isEditingBudget, setIsEditingBudget] = useState(monthlyBudget <= 0);
  const [tempBudgetInput, setTempBudgetInput] = useState<string>(
    monthlyBudget > 0 ? String(monthlyBudget) : '8000'
  );

  // New Expense form state
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState<string | null>(null);

  // Filter & Search
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [filterAcademicOnly, setFilterAcademicOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // AI Analysis State
  const [analysis, setAnalysis] = useState<SpendingAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Core calculations
  const totalSpent = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const remainingBudget = Math.max(0, monthlyBudget - totalSpent);
  const percentageUsed = monthlyBudget > 0 ? Math.round((totalSpent / monthlyBudget) * 100) : 0;

  // Academic (Education & Projects) vs Lifestyle
  const academicExpenses = expenses.filter(
    (e) => e.category === 'Education' || e.category === 'Projects'
  );
  const academicInvestmentTotal = academicExpenses.reduce((sum, e) => sum + e.amount, 0);
  const academicPercentage = totalSpent > 0 ? Math.round((academicInvestmentTotal / totalSpent) * 100) : 0;
  const lifestyleTotal = totalSpent - academicInvestmentTotal;

  // Determine budget alert status
  const budgetStatus: BudgetAlertLevel =
    percentageUsed >= 90 ? 'Critical' : percentageUsed >= 70 ? 'Warning' : 'Normal';

  // Automatically trigger AI analysis on initial load if expenses exist
  useEffect(() => {
    if (monthlyBudget > 0 && expenses.length > 0 && !analysis) {
      handleRunAiAnalysis();
    }
  }, [monthlyBudget, expenses.length]);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(tempBudgetInput);
    if (isNaN(val) || val <= 0) {
      return;
    }
    onUpdateBudget(val);
    setIsEditingBudget(false);
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid expense amount greater than 0.');
      return;
    }
    if (!reason.trim()) {
      setFormError('Please specify the reason or item description.');
      return;
    }

    const isAcademic = category === 'Education' || category === 'Projects';

    const newExpense: ExpenseItem = {
      id: `exp-${Date.now()}`,
      amount: parsedAmount,
      reason: reason.trim(),
      category,
      date,
      isAcademic,
    };

    onAddExpense(newExpense);
    setAmount('');
    setReason('');
  };

  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const result = await requestExpenseAnalysis(monthlyBudget, expenses, '₹');
      setAnalysis(result);
    } catch (err: any) {
      console.error(err);
      setAnalysisError('Could not complete AI spending analysis. Please retry.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Quick preset button handler
  const loadQuickPreset = (preset: { reason: string; amount: number; category: ExpenseCategory }) => {
    setReason(preset.reason);
    setAmount(String(preset.amount));
    setCategory(preset.category);
    setDate(new Date().toISOString().split('T')[0]);
  };

  // Filtered expense list
  const filteredExpenses = expenses.filter((item) => {
    if (filterAcademicOnly && !item.isAcademic) return false;
    if (selectedCategoryFilter !== 'All' && item.category !== selectedCategoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.reason.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        String(item.amount).includes(q)
      );
    }
    return true;
  });

  // Category breakdown for chart
  const categories: ExpenseCategory[] = [
    'Food',
    'Travel',
    'Education',
    'Projects',
    'Entertainment',
    'Shopping',
    'Other',
  ];

  const categoryTotals = categories.map((cat) => {
    const items = expenses.filter((e) => e.category === cat);
    const catTotal = items.reduce((sum, e) => sum + e.amount, 0);
    const pct = totalSpent > 0 ? Math.round((catTotal / totalSpent) * 100) : 0;
    return {
      category: cat,
      total: catTotal,
      percentage: pct,
      count: items.length,
      isAcademic: cat === 'Education' || cat === 'Projects',
    };
  }).filter((c) => c.total > 0 || c.count > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 mb-1">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span>PathPilot Phase 2 · Smart Student Expense Tracker</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Expenses & Academic Budget
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track daily living costs, protect academic investments, and receive AI-guided spending insights with respectful alerts.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <button
            onClick={() => setIsEditingBudget(true)}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            {monthlyBudget > 0 ? `Budget: ₹${monthlyBudget.toLocaleString()}` : 'Set Monthly Budget'}
          </button>

          <button
            onClick={handleRunAiAnalysis}
            disabled={isAnalyzing || expenses.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Analyzing Patterns...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI Spending Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal/Prompt: Set Monthly Budget on first use */}
      {isEditingBudget && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step 1: Set Your Monthly Budget</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              How much do you plan to spend this month?
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              PathPilot monitors your cash flow, distinguishes academic project investments from non-essential lifestyle expenses, and triggers respectful budget alerts.
            </p>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Monthly Budget Amount (₹)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-mono">₹</span>
                    <input
                      type="number"
                      min="1000"
                      step="500"
                      required
                      value={tempBudgetInput}
                      onChange={(e) => setTempBudgetInput(e.target.value)}
                      placeholder="e.g. 8000"
                      className="w-full pl-7 pr-3 py-2 text-xs text-white bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono text-base"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors whitespace-nowrap"
                  >
                    Save Budget
                  </button>
                </div>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-slate-400 text-[11px]">Quick Presets:</span>
                {[5000, 8000, 10000, 12000, 15000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTempBudgetInput(String(preset))}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
                  >
                    ₹{preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4 Key Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Monthly Budget */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
            <span>Monthly Budget</span>
            <Wallet className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            ₹{monthlyBudget.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Target student monthly cap
          </div>
        </div>

        {/* Metric 2: Total Spent & Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
            <span>Total Spent</span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                budgetStatus === 'Critical'
                  ? 'bg-rose-100 text-rose-800'
                  : budgetStatus === 'Warning'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {budgetStatus} Alert
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            ₹{totalSpent.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            <span className="font-semibold text-slate-700 font-mono">{percentageUsed}%</span> of budget used
          </div>
        </div>

        {/* Metric 3: Remaining Budget */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
            <span>Remaining Budget</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className={`text-2xl font-bold tracking-tight font-mono ${remainingBudget === 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            ₹{remainingBudget.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            {remainingBudget > 0 ? 'Available for month' : 'Budget limit exceeded!'}
          </div>
        </div>

        {/* Metric 4: Academic & Project Investment */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center justify-between">
            <span>Academic & Projects</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            ₹{academicInvestmentTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{academicPercentage}% career investment</span>
          </div>
        </div>
      </div>

      {/* Budget Progress Bar & Alert Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Monthly Budget Utilization Progress
              </h2>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  budgetStatus === 'Critical'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : budgetStatus === 'Warning'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {budgetStatus === 'Critical' ? (
                  <span className="flex items-center gap-1"><AlertOctagon className="w-3 h-3" /> Critical (&gt;90%)</span>
                ) : budgetStatus === 'Warning' ? (
                  <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Warning (70-90%)</span>
                ) : (
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Normal (&lt;70%)</span>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {budgetStatus === 'Critical'
                ? 'High utilization warning: You have exceeded or are close to exhausting your monthly budget.'
                : budgetStatus === 'Warning'
                ? 'Approaching limit: Keep non-essential food and leisure spending restrained.'
                : 'Healthy financial standing: You have sufficient reserve for academic materials and hardware.'}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-900 font-mono">
              ₹{totalSpent.toLocaleString()} / ₹{monthlyBudget.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
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

      {/* AI Spending Analysis & Respectful Warnings Section */}
      {analysis && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  AI-Powered Spending Analysis & Career Investment Breakdown
                </h2>
                <p className="text-xs text-slate-500">
                  Evaluated based on expense amount, reason, category, frequency, and academic targets.
                </p>
              </div>
            </div>

            <button
              onClick={handleRunAiAnalysis}
              disabled={isAnalyzing}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 self-start sm:self-center"
            >
              <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>Refresh Insights</span>
            </button>
          </div>

          {/* Respectful Warning for Non-Essential Spending (Prompt requirement) */}
          {analysis.respectfulWarnings && analysis.respectfulWarnings.length > 0 && (
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Spending Pattern Advisory</span>
              </div>
              {analysis.respectfulWarnings.map((warn, wIdx) => (
                <p key={wIdx} className="text-xs text-amber-800 leading-relaxed pl-6">
                  {warn}
                </p>
              ))}
            </div>
          )}

          {/* Career Investment Note (Education & Projects) */}
          {analysis.academicCareerNote && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900">
                <span className="font-semibold block mb-0.5">Academic & Project Impact:</span>
                <p className="text-emerald-800 leading-relaxed">{analysis.academicCareerNote}</p>
              </div>
            </div>
          )}

          {/* AI Insights & Actionable Suggestions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2.5 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-600" />
                <span>Key Spending Observations</span>
              </h3>
              <ul className="space-y-2 text-slate-600">
                {analysis.aiInsights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span className="leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2.5 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Actionable Student Budget Recommendations</span>
              </h3>
              <ul className="space-y-2 text-slate-600">
                {analysis.actionableSuggestions.map((sugg, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <span className="leading-relaxed">{sugg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Two Columns: Add Expense Form & Category Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Add Expense Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-slate-700" />
              <span>Add New Student Expense</span>
            </h2>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-xs font-mono">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="e.g. 850"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Reason / Item Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arduino Sensor Kit, Dinner at Olive Bistro, Textbook"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-2.5 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="Food">Food (Meals & Dining)</option>
                    <option value="Travel">Travel (Metro, Bus, Transit)</option>
                    <option value="Education">Education (Books & Courses)</option>
                    <option value="Projects">Projects (Hardware & Cloud)</option>
                    <option value="Entertainment">Entertainment & Outings</option>
                    <option value="Shopping">Shopping & Lifestyle</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Indicator if Academic */}
              {(category === 'Education' || category === 'Projects') && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Classified as Academic & Career Investment</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
              >
                Add Expense to Ledger
              </button>
            </form>

            {/* Quick Demo Presets */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Quick Preset Fillers:
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => loadQuickPreset({ reason: 'Weekend Restaurant Dinner at Olive Bistro', amount: 1300, category: 'Food' })}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-[11px] transition-colors"
                >
                  Restaurant Meal (₹1,300)
                </button>
                <button
                  type="button"
                  onClick={() => loadQuickPreset({ reason: 'Swiggy Restaurant Takeout', amount: 1200, category: 'Food' })}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-[11px] transition-colors"
                >
                  Food Delivery (₹1,200)
                </button>
                <button
                  type="button"
                  onClick={() => loadQuickPreset({ reason: 'Raspberry Pi 4 for Embedded IoT Capstone', amount: 3500, category: 'Projects' })}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-[11px] transition-colors"
                >
                  IoT Hardware (₹3,500)
                </button>
                <button
                  type="button"
                  onClick={() => loadQuickPreset({ reason: 'Algorithms Course Textbook', amount: 950, category: 'Education' })}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-[11px] transition-colors"
                >
                  Textbook (₹950)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Category Breakdown & Distribution Chart */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Spending Distribution by Category
                </h2>
                <span className="text-xs text-slate-500 font-mono">
                  {expenses.length} Records
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Visualizing resource allocation between academic investments and lifestyle necessities.
              </p>

              {/* Segmented Cumulative Bar Chart */}
              <div className="mb-6">
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                  {categoryTotals.map((cat, idx) => {
                    const colors: Record<ExpenseCategory, string> = {
                      Food: '#f59e0b', // amber
                      Travel: '#3b82f6', // blue
                      Education: '#10b981', // emerald
                      Projects: '#059669', // dark emerald
                      Entertainment: '#ec4899', // pink
                      Shopping: '#8b5cf6', // purple
                      Other: '#64748b', // slate
                    };
                    return (
                      <div
                        key={idx}
                        title={`${cat.category}: ₹${cat.total.toLocaleString()} (${cat.percentage}%)`}
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: colors[cat.category] || '#94a3b8',
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Category Breakdown Bars */}
              <div className="space-y-3">
                {categoryTotals.map((cat, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-medium">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{cat.category}</span>
                        {cat.isAcademic && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-semibold">
                            Academic Investment
                          </span>
                        )}
                      </div>
                      <div className="text-slate-900 font-mono font-bold">
                        ₹{cat.total.toLocaleString()}
                        <span className="text-slate-400 font-normal ml-1.5 font-sans">
                          ({cat.percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cat.isAcademic ? 'bg-emerald-600' : 'bg-slate-800'}`}
                        style={{ width: `${Math.min(100, cat.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic vs Lifestyle Comparison Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs bg-slate-50/50 p-3 rounded-lg">
              <div>
                <span className="text-slate-500 block text-[11px]">Academic & Projects:</span>
                <span className="text-slate-900 font-bold font-mono text-sm">
                  ₹{academicInvestmentTotal.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-600 block">
                  {academicPercentage}% of budget allocated
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Living & Lifestyle:</span>
                <span className="text-slate-900 font-bold font-mono text-sm">
                  ₹{lifestyleTotal.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {100 - academicPercentage}% operational spending
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expense History Ledger */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Expense History & Audit Log
            </h2>
            <p className="text-xs text-slate-500">
              Detailed transaction records with academic tag filters.
            </p>
          </div>

          {/* Search & Academic Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterAcademicOnly(!filterAcademicOnly)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                filterAcademicOnly
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Academic Only ({academicExpenses.length})
            </button>

            {/* Category Selector */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <div className="relative w-44">
              <input
                type="text"
                placeholder="Search reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-medium">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Reason / Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-slate-500 font-mono whitespace-nowrap">
                    {item.date}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-900">
                    {item.reason}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-slate-700">
                      {item.category}
                    </span>
                    {item.isAcademic && (
                      <span className="ml-2 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                        Academic
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono tabular-nums whitespace-nowrap">
                    ₹{item.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => onDeleteExpense(item.id)}
                      title="Delete expense"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredExpenses.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No expense records found matching current criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
