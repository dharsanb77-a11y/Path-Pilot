import React, { useState } from 'react';
import { User, ResourceItem } from '../types';
import { 
  BookOpen, ExternalLink, CheckCircle2, Clock, 
  Layers, Bookmark, Sparkles, Filter 
} from 'lucide-react';

interface ResourcesViewProps {
  user: User;
  resources: ResourceItem[];
  onToggleResourceComplete: (resourceId: string) => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  user,
  resources,
  onToggleResourceComplete,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Essential Documentation & Standards',
    'Recommended Books & Deep Dives',
    'Hands-On Labs & Repositories',
    'Industry Benchmarks & Architecture',
  ];

  const filteredResources = resources.filter((res) => {
    if (selectedCategory === 'All') return true;
    return res.category === selectedCategory;
  });

  const completedCount = resources.filter((r) => r.completed).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 mb-1">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Personalized Academic Curriculum</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Resource Recommendations for {user.interest || user.department}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tailored literature, research papers, interactive lab codebases, and production standards for {user.year}.
          </p>
        </div>

        {/* Progress pill */}
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-xs text-right self-start sm:self-center">
          <div className="text-[11px] text-slate-500 font-medium">Study Progression</div>
          <div className="text-sm font-bold text-slate-900 tabular-nums">
            {completedCount} / {resources.length} Completed
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredResources.map((res, idx) => (
          <div
            key={res.id || `resource-${res.title || 'item'}-${idx}`}
            className={`bg-white border rounded-xl p-6 shadow-xs flex flex-col justify-between transition-all ${
              res.completed ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              {/* Top metadata */}
              <div className="flex items-center justify-between gap-2 mb-2 text-[11px] text-slate-500 font-medium">
                <span className="text-slate-700 font-semibold">{res.level}</span>
                <span aria-hidden="true">·</span>
                <span>{res.type}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{res.estimatedHours} hrs</span>
                </span>

                <div className="ml-auto">
                  <button
                    onClick={() => onToggleResourceComplete(res.id)}
                    className={`flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md transition-colors ${
                      res.completed
                        ? 'bg-emerald-100 text-emerald-800 font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${res.completed ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span>{res.completed ? 'Completed' : 'Mark Done'}</span>
                  </button>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                {res.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {res.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">{res.category}</span>
              <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-emerald-700 transition-colors"
              >
                <span>Access Resource</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
