import React, { useState } from 'react';
import { User, SkillMetric, HistoricalScore } from '../types';
import { DEPARTMENTS, STUDY_YEARS } from '../data/departmentData';
import { X, UserCog, Plus, Layers, Award, Check } from 'lucide-react';

interface DataEntryModalProps {
  user: User;
  monthlyBudget?: number;
  onClose: () => void;
  onUpdateUser: (updatedUser: User) => void;
  onAddSkill: (skill: SkillMetric) => void;
  onAddHistoricalScore: (score: HistoricalScore) => void;
  onUpdateBudget?: (budget: number) => void;
}

export const DataEntryModal: React.FC<DataEntryModalProps> = ({
  user,
  monthlyBudget = 8000,
  onClose,
  onUpdateUser,
  onAddSkill,
  onAddHistoricalScore,
  onUpdateBudget,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'skill' | 'score' | 'budget'>('profile');

  // Budget Form state
  const [budgetVal, setBudgetVal] = useState<number>(monthlyBudget);

  // Profile Form state
  const [name, setName] = useState(user.name);
  const [department, setDepartment] = useState(user.department);
  const [year, setYear] = useState(user.year);
  const [interest, setInterest] = useState(user.interest);
  const [targetRole, setTargetRole] = useState(user.targetRole || '');
  const [bio, setBio] = useState(user.bio || '');

  // Skill Form state
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState<number>(80);
  const [skillCategory, setSkillCategory] = useState<SkillMetric['category']>('System Design');

  // Score Form state
  const [scoreProjectTitle, setScoreProjectTitle] = useState('');
  const [scoreDate, setScoreDate] = useState('Oct 2026');
  const [totalScore, setTotalScore] = useState<number>(85);
  const [technicalComplexity, setTechnicalComplexity] = useState<number>(21);
  const [industryRelevance, setIndustryRelevance] = useState<number>(22);
  const [codeArchitectureQuality, setCodeArchitectureQuality] = useState<number>(21);
  const [innovationAndImpact, setInnovationAndImpact] = useState<number>(21);

  const [message, setMessage] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...user,
      name,
      department,
      year,
      interest,
      targetRole,
      bio,
    };
    onUpdateUser(updated);
    setMessage('Profile updated successfully.');
    setTimeout(() => setMessage(null), 2500);
  };

  const handleSaveSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    const newSkill: SkillMetric = {
      name: skillName.trim(),
      level: skillLevel,
      category: skillCategory,
      growth: 12,
    };
    onAddSkill(newSkill);
    setSkillName('');
    setMessage(`Added skill "${newSkill.name}" (${newSkill.level}%)`);
    setTimeout(() => setMessage(null), 2500);
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoreProjectTitle.trim()) return;

    const newScore: HistoricalScore = {
      date: scoreDate,
      projectTitle: scoreProjectTitle.trim(),
      score: totalScore,
      technicalComplexity,
      industryRelevance,
      codeArchitectureQuality,
      innovationAndImpact,
    };
    onAddHistoricalScore(newScore);
    setScoreProjectTitle('');
    setMessage(`Logged evaluation score for "${newScore.projectTitle}"`);
    setTimeout(() => setMessage(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Basic Data Entry & Profile Configuration
            </h2>
            <p className="text-xs text-slate-500">
              Update your academic credentials, log acquired skills, or record manual scores.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 p-2 bg-slate-100/80 border-b border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Academic Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('skill')}
            className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-colors ${
              activeTab === 'skill'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Add Acquired Skill
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('score')}
            className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-colors ${
              activeTab === 'score'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Log Project Score
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('budget')}
            className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-colors ${
              activeTab === 'budget'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Budget
          </button>
        </div>

        {message && (
          <div className="mx-6 mt-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Year of Study
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {STUDY_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Core Domain Focus / Interest
                </label>
                <input
                  type="text"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Target Career Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Distributed Infrastructure Engineer"
                  className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Save Profile Updates
                </button>
              </div>
            </form>
          )}

          {activeTab === 'skill' && (
            <form onSubmit={handleSaveSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Skill or Technology Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rust Systems Programming, Kafka Messaging, PyTorch"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Competency Category
                </label>
                <select
                  value={skillCategory}
                  onChange={(e) => setSkillCategory(e.target.value as SkillMetric['category'])}
                  className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="System Design">System Design</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Algorithms">Algorithms</option>
                  <option value="Domain Tooling">Domain Tooling</option>
                  <option value="Security & Testing">Security & Testing</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Proficiency Level ({skillLevel}%)
                  </label>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(Number(e.target.value))}
                  className="w-full accent-slate-900 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Skill to Dashboard</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'score' && (
            <form onSubmit={handleSaveScore} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus Engine"
                  value={scoreProjectTitle}
                  onChange={(e) => setScoreProjectTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Evaluation Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oct 2026"
                    value={scoreDate}
                    onChange={(e) => setScoreDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Overall Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="100"
                    value={totalScore}
                    onChange={(e) => setTotalScore(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-slate-600 block mb-0.5">Complexity (0-25)</label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={technicalComplexity}
                    onChange={(e) => setTechnicalComplexity(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-0.5">Relevance (0-25)</label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={industryRelevance}
                    onChange={(e) => setIndustryRelevance(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-0.5">Architecture (0-25)</label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={codeArchitectureQuality}
                    onChange={(e) => setCodeArchitectureQuality(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-0.5">Innovation (0-25)</label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={innovationAndImpact}
                    onChange={(e) => setInnovationAndImpact(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Record Evaluation in Historical Metrics
                </button>
              </div>
            </form>
          )}

          {activeTab === 'budget' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onUpdateBudget && budgetVal > 0) {
                  onUpdateBudget(budgetVal);
                  setMessage(`Monthly budget updated to ₹${budgetVal.toLocaleString()}`);
                  setTimeout(() => setMessage(null), 2500);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Monthly Student Living & Project Budget (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-mono">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={budgetVal}
                    onChange={(e) => setBudgetVal(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-base"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <span className="text-slate-500 text-[11px] self-center">Presets:</span>
                {[5000, 8000, 10000, 15000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setBudgetVal(amt)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-mono"
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 pt-2">
                This budget is used by PathPilot AI to monitor your monthly burn rate, separate educational investments from leisure spending, and send alert warnings.
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Save Budget Cap
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
