import React, { useState } from 'react';
import { User, ProjectIdea, ProjectSubmission } from '../types';
import { requestProjectSuggestions } from '../services/api';
import { 
  Lightbulb, Sparkles, Clock, Layers, ArrowUpRight, 
  RefreshCw, Filter, CheckCircle2, ChevronDown, ChevronUp, Target
} from 'lucide-react';

interface ProjectIdeasViewProps {
  user: User;
  projectIdeas: ProjectIdea[];
  onSelectProjectForEvaluation: (idea: ProjectIdea) => void;
  onUpdateProjectIdeas: (newIdeas: ProjectIdea[]) => void;
}

export const ProjectIdeasView: React.FC<ProjectIdeasViewProps> = ({
  user,
  projectIdeas,
  onSelectProjectForEvaluation,
  onUpdateProjectIdeas,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null);

  const handleGenerateFreshIdeas = async () => {
    setLoading(true);
    try {
      const result = await requestProjectSuggestions(
        user.department,
        user.year,
        user.interest || 'Distributed Systems & Cloud Infrastructure'
      );
      if (result.projects && result.projects.length > 0) {
        onUpdateProjectIdeas(result.projects);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredIdeas = projectIdeas.filter((idea) => {
    const matchesDifficulty =
      selectedDifficulty === 'All' ||
      idea.difficulty.toLowerCase().includes(selectedDifficulty.toLowerCase());
    const matchesQuery =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.technologies.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDifficulty && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 mb-1">
            <Lightbulb className="w-4 h-4 text-emerald-600" />
            <span>Curated for {user.interest || user.department}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Industry-Relevant Project Suggestions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Selected for {user.year} in {user.department} to construct verifiable proof-of-work for internships and graduate admissions.
          </p>
        </div>

        <button
          onClick={handleGenerateFreshIdeas}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-center disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Generating AI Ideas...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Generate Fresh AI Ideas</span>
            </>
          )}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        {/* Difficulty Filter Tabs */}
        <div className="flex items-center gap-1">
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedDifficulty === diff
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Filter by tech or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
          />
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIdeas.map((idea) => {
          const isExpanded = expandedIdeaId === idea.id;

          return (
            <div
              key={idea.id}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all text-left"
            >
              <div>
                {/* Meta details: Clean unboxed metadata */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2 font-medium">
                  <span className="text-slate-700 font-semibold">{idea.difficulty}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{idea.estimatedWeeks} Weeks</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{idea.domain.split('&')[0]}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                  {idea.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {idea.description}
                </p>

                {/* Tech stack */}
                <div className="mb-4">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5 font-semibold">
                    Core Technologies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {idea.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[11px] font-medium rounded-md"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Learning Outcomes & Industry Relevance */}
                <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-2 mb-4">
                  <div>
                    <span className="font-semibold text-slate-800 block text-[11px] mb-1">
                      Key Competencies Developed:
                    </span>
                    <ul className="space-y-1 text-slate-600 text-[11px]">
                      {idea.learningOutcomes.slice(0, 3).map((out, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{out}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {idea.industryRelevance && (
                    <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-800 block mb-0.5">Industry Value:</span>
                      {idea.industryRelevance}
                    </div>
                  )}
                </div>

                {/* Milestone breakdown (collapsible) */}
                {idea.milestones && idea.milestones.length > 0 && (
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => setExpandedIdeaId(isExpanded ? null : idea.id)}
                      className="flex items-center justify-between w-full text-xs font-medium text-slate-600 hover:text-slate-900 py-1"
                    >
                      <span>Weekly Implementation Breakdown</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-1.5 pl-2 border-l border-slate-200 text-[11px] text-slate-600">
                        {idea.milestones.map((m, idx) => (
                          <div key={idx} className="leading-snug">
                            {m}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onSelectProjectForEvaluation(idea)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-lg transition-colors shadow-xs"
                >
                  <span>Submit / Evaluate with AI</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredIdeas.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
          <p className="text-xs text-slate-500 mb-3">No project ideas matched the current filter.</p>
          <button
            onClick={() => {
              setSelectedDifficulty('All');
              setSearchQuery('');
            }}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
