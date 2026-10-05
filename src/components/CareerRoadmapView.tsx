import React from 'react';
import { User, RoadmapMilestone } from '../types';
import { 
  CheckSquare, CheckCircle2, Circle, Clock, 
  Layers, Target, Award, ArrowRight, ShieldCheck 
} from 'lucide-react';

interface CareerRoadmapViewProps {
  user: User;
  milestones: RoadmapMilestone[];
  onToggleTask: (milestoneId: string, taskId: string) => void;
  onNavigateToEvaluator: () => void;
}

export const CareerRoadmapView: React.FC<CareerRoadmapViewProps> = ({
  user,
  milestones,
  onToggleTask,
  onNavigateToEvaluator,
}) => {
  const totalTasks = milestones.reduce((acc, m) => acc + m.tasks.length, 0);
  const completedTasks = milestones.reduce(
    (acc, m) => acc + m.tasks.filter((t) => t.done).length,
    0
  );
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 mb-1">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span>Target Role: {user.targetRole || 'Software Infrastructure Engineer'}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Career Development & Milestone Roadmap
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Structured step-by-step path designed for {user.year} in {user.department} ({user.interest}).
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs min-w-[240px] self-start sm:self-center">
          <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
            <span>Roadmap Completion</span>
            <span className="font-bold text-slate-900 tabular-nums">{percentage}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-slate-900 h-full rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
            <span>{completedTasks} of {totalTasks} milestones done</span>
            <span className="text-emerald-700 font-medium">On Track</span>
          </div>
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div className="space-y-6">
        {milestones.map((milestone, idx) => {
          const isPhaseCompleted = milestone.tasks.every((t) => t.done);
          const isPhaseInProgress = !isPhaseCompleted && milestone.tasks.some((t) => t.done);

          return (
            <div
              key={milestone.id}
              className={`bg-white border rounded-xl p-6 shadow-xs transition-all ${
                isPhaseCompleted
                  ? 'border-emerald-200 bg-emerald-50/10'
                  : isPhaseInProgress
                  ? 'border-slate-900 ring-1 ring-slate-900/10'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                      isPhaseCompleted
                        ? 'bg-emerald-600 text-white'
                        : isPhaseInProgress
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mb-1">
                      <span className="font-semibold text-slate-900">{milestone.phase}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{milestone.timeframe}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-semibold ${
                          isPhaseCompleted
                            ? 'text-emerald-700'
                            : isPhaseInProgress
                            ? 'text-slate-900'
                            : 'text-slate-500'
                        }`}
                      >
                        {isPhaseCompleted
                          ? 'Phase Completed'
                          : isPhaseInProgress
                          ? 'In Active Progress'
                          : 'Upcoming Phase'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {milestone.title}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 self-start md:self-center">
                  {milestone.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                {milestone.description}
              </p>

              {/* Tasks Checklist */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Actionable Milestones Checklist:
                </div>
                {milestone.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onToggleTask(milestone.id, task.id)}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors text-xs ${
                      task.done
                        ? 'bg-emerald-50/40 border-emerald-200 text-slate-900'
                        : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {task.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <span className={`leading-relaxed ${task.done ? 'line-through text-slate-500' : ''}`}>
                      {task.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Box */}
      <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white mb-1">
            Ready to validate your implementation with AI?
          </h3>
          <p className="text-xs text-slate-400">
            Submit your completed milestone project to PathPilot AI to receive your academic career score.
          </p>
        </div>

        <button
          onClick={onNavigateToEvaluator}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors whitespace-nowrap"
        >
          <span>Submit Project to Evaluator</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
