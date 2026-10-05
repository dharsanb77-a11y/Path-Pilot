import React, { useState } from 'react';
import { User } from '../types';
import { DEPARTMENT_INTERESTS } from '../data/departmentData';
import { ArrowRight, Compass, Sparkles, BookOpen, CheckCircle, ChevronRight, Layers } from 'lucide-react';

interface OnboardingInterestProps {
  user: User;
  onInterestSelected: (interest: string, targetRole?: string) => void;
}

export const OnboardingInterest: React.FC<OnboardingInterestProps> = ({
  user,
  onInterestSelected,
}) => {
  const departmentInterests = DEPARTMENT_INTERESTS[user.department] || [
    {
      id: 'general-applied-engineering',
      name: `${user.department} Core Engineering & Systems`,
      description: 'Comprehensive engineering principles, state of the art tools, and applied capstone designs.',
      targetRoles: ['Systems Engineer', 'Domain Specialist', 'Research Engineer'],
      popularSkills: ['CAD/Simulation', 'Analytical Modeling', 'Automation', 'Domain Tooling'],
    },
    {
      id: 'software-computation-focus',
      name: `Computational & Software Systems in ${user.department}`,
      description: 'Applying algorithms, data analytics, and software architectures to domain challenges.',
      targetRoles: ['Computational Specialist', 'Software Lead'],
      popularSkills: ['Python', 'Data Pipelines', 'Modeling Tools', 'Microservices'],
    },
  ];

  const [selectedInterest, setSelectedInterest] = useState<string>(
    departmentInterests[0]?.name || 'Systems Architecture'
  );
  const [selectedTargetRole, setSelectedTargetRole] = useState<string>(
    departmentInterests[0]?.targetRoles?.[0] || 'Domain Engineer'
  );
  const [customInterest, setCustomInterest] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const handleSelectOption = (item: (typeof departmentInterests)[0]) => {
    setIsCustomMode(false);
    setSelectedInterest(item.name);
    setSelectedTargetRole(item.targetRoles[0] || 'Software Engineer');
  };

  const handleConfirm = () => {
    const finalInterest = isCustomMode && customInterest.trim() ? customInterest.trim() : selectedInterest;
    onInterestSelected(finalInterest, selectedTargetRole);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 flex flex-col justify-center items-center">
      <div className="w-full max-w-4xl">
        {/* Onboarding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 mb-3">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Welcome, {user.name} · Step 2 of 2</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            What is your core interest in {user.department}?
          </h1>

          <p className="mt-2 text-sm text-slate-600 max-w-2xl mx-auto">
            PathPilot personalizes your resource recommendations, roadmaps, and AI project suggestions around your chosen domain focus for {user.year}.
          </p>
        </div>

        {/* Domain Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {departmentInterests.map((item) => {
            const isSelected = !isCustomMode && selectedInterest === item.name;
            return (
              <div
                key={item.id}
                onClick={() => handleSelectOption(item)}
                className={`relative cursor-pointer rounded-xl p-5 border text-left transition-all ${
                  isSelected
                    ? 'bg-white border-slate-900 ring-2 ring-slate-900/10 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                    {item.name}
                  </h3>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'border-slate-300 bg-white text-transparent'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {item.description}
                </p>

                {/* Target roles & trending skills */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-medium text-slate-700">Target Roles:</span>
                    <span className="text-slate-500 truncate">{item.targetRoles.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="font-medium text-slate-700">Core Skills:</span>
                    <span className="text-slate-500 truncate">{item.popularSkills.slice(0, 4).join(' · ')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Interest Option */}
        <div
          onClick={() => setIsCustomMode(true)}
          className={`cursor-pointer rounded-xl p-4 border transition-all mb-8 ${
            isCustomMode
              ? 'bg-white border-slate-900 ring-2 ring-slate-900/10'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-slate-700" />
            <span className="text-xs font-semibold text-slate-900">
              Have a specific niche or custom interdisciplinary focus?
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Autonomous Drone Navigation, Neuromorphic Computing, FinTech Microservices..."
              value={customInterest}
              onFocus={() => setIsCustomMode(true)}
              onChange={(e) => {
                setCustomInterest(e.target.value);
                setIsCustomMode(true);
              }}
              className="flex-1 px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
            />
          </div>
        </div>

        {/* Value Proposition Preview Box */}
        <div className="bg-slate-900 text-white rounded-xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">
                Selected Focus:{' '}
                <span className="text-emerald-400 font-bold">
                  {isCustomMode && customInterest.trim() ? customInterest : selectedInterest}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                We will configure your project generator, evaluation rubrics, and career milestones immediately.
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <span>Confirm & Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
