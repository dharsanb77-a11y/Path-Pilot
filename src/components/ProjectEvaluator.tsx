import React, { useState } from 'react';
import { User, ProjectSubmission, ProjectEvaluation } from '../types';
import { requestProjectEvaluation } from '../services/api';
import { 
  Sparkles, CheckCircle2, AlertCircle, ArrowRight, Code, GitBranch, 
  Layers, Award, ShieldCheck, ChevronRight, RefreshCw, BookmarkCheck
} from 'lucide-react';

interface ProjectEvaluatorProps {
  user: User;
  onSaveEvaluation: (submission: ProjectSubmission) => void;
  initialSubmission?: ProjectSubmission | null;
}

export const ProjectEvaluator: React.FC<ProjectEvaluatorProps> = ({
  user,
  onSaveEvaluation,
  initialSubmission,
}) => {
  const [projectTitle, setProjectTitle] = useState(
    initialSubmission?.title || 'Distributed Log Replicator with Raft Consensus Engine'
  );
  const [domain, setDomain] = useState(
    initialSubmission?.domain || user.interest || 'Distributed Systems & Cloud Infrastructure'
  );
  const [techStackInput, setTechStackInput] = useState(
    initialSubmission?.techStack?.join(', ') || 'TypeScript, gRPC, Docker, Jest'
  );
  const [description, setDescription] = useState(
    initialSubmission?.description ||
      'An implementation of the Raft consensus algorithm enabling distributed log replication across 3 to 5 nodes with automated leader election, heartbeats, and client RPC interface.'
  );
  const [architectureDetails, setArchitectureDetails] = useState(
    initialSubmission?.architectureDetails ||
      'Three-node cluster communicating via gRPC streaming. Nodes maintain randomized election timers, persistent write-ahead logs on disk, and synchronized commit index pointers.'
  );
  const [challengesFaced, setChallengesFaced] = useState(
    initialSubmission?.challengesFaced ||
      'Preventing split-vote deadlocks during network partitions and safely handling term discrepancies when a partitioned leader rejoins.'
  );
  const [githubUrl, setGithubUrl] = useState(
    initialSubmission?.githubUrl || 'https://github.com/alexrivera/raft-replicated-log'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEvaluation, setCurrentEvaluation] = useState<ProjectEvaluation | null>(
    initialSubmission?.evaluation || null
  );
  const [evalSource, setEvalSource] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Quick template loaders
  const loadTemplate = (type: 'raft' | 'limiter' | 'ml') => {
    if (type === 'raft') {
      setProjectTitle('Distributed Log Replicator with Raft Consensus Engine');
      setDomain(user.interest || 'Distributed Systems & Cloud Infrastructure');
      setTechStackInput('TypeScript, gRPC, Docker, RocksDB, Jest');
      setDescription(
        'An implementation of the Raft consensus algorithm enabling distributed log replication across 3 to 5 nodes with automated leader election, heartbeats, and client RPC interface.'
      );
      setArchitectureDetails(
        'Three-node cluster communicating via gRPC streaming. Nodes maintain randomized election timers, persistent write-ahead logs on disk, and synchronized commit index pointers.'
      );
      setChallengesFaced(
        'Preventing split-vote deadlocks during network partitions and safely handling term discrepancies when a partitioned leader rejoins.'
      );
      setGithubUrl('https://github.com/alexrivera/raft-replicated-log');
    } else if (type === 'limiter') {
      setProjectTitle('Sliding-Window API Rate Limiter & Token Gateway');
      setDomain(user.interest || 'Distributed Systems & Cloud Infrastructure');
      setTechStackInput('Node.js, Express, Redis, Docker, Prometheus');
      setDescription(
        'A high-throughput reverse proxy and sliding window rate limiting gateway monitoring IP and JWT token allowances using atomic Redis transactions.'
      );
      setArchitectureDetails(
        'Express middleware wrapping Redis MULTI/EXEC pipeline transactions with rolling 60-second timestamps, exporting Prometheus latency metrics.'
      );
      setChallengesFaced(
        'Minimizing roundtrip latency overhead below 1.5ms and preventing race conditions during bursty parallel traffic spikes.'
      );
      setGithubUrl('https://github.com/alexrivera/redis-sliding-limiter');
    } else {
      setProjectTitle('Automated Domain Code Quality & Vulnerability Auditor');
      setDomain(user.interest || 'Systems Architecture');
      setTechStackInput('TypeScript, React, Babel AST, Vite');
      setDescription(
        'A static analysis auditor that parses project source files, applies security heuristics against OWASP Top 10 vulnerabilities, and outputs actionable developer fix cards.'
      );
      setArchitectureDetails(
        'Abstract Syntax Tree (AST) visitor patterns examining function scopes, unsafe string concatenations, and unvalidated environment variables.'
      );
      setChallengesFaced(
        'Accurately identifying vulnerability contexts without causing false positives on legitimate template literals.'
      );
      setGithubUrl('https://github.com/alexrivera/code-quality-auditor');
    }
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim() || !description.trim()) {
      setError('Please provide at least a project title and description.');
      return;
    }

    setError(null);
    setLoading(true);
    setSavedSuccess(false);

    try {
      const techStack = techStackInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const result = await requestProjectEvaluation({
        projectTitle: projectTitle.trim(),
        department: user.department,
        interest: domain.trim(),
        year: user.year,
        description: description.trim(),
        githubUrl: githubUrl.trim(),
        architectureDetails: architectureDetails.trim(),
        challengesFaced: challengesFaced.trim(),
        techStack,
      });

      setCurrentEvaluation(result.evaluation);
      setEvalSource(result.source);
    } catch (err: any) {
      console.error(err);
      setError('Evaluation could not be completed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDashboard = () => {
    if (!currentEvaluation) return;

    const submission: ProjectSubmission = {
      id: initialSubmission?.id || `sub-${Date.now()}`,
      title: projectTitle,
      domain,
      department: user.department,
      description,
      techStack: techStackInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      githubUrl,
      architectureDetails,
      challengesFaced,
      submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      evaluation: currentEvaluation,
    };

    onSaveEvaluation(submission);
    setSavedSuccess(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>PathPilot AI Project Evaluator</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Project Code & Architecture Assessment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit your project proposal or codebase details to receive actionable industry feedback, skill benchmarks, and career improvement scores.
          </p>
        </div>

        {/* Quick Demo Pre-fill */}
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <span className="text-xs text-slate-500">Quick Fill:</span>
          <button
            type="button"
            onClick={() => loadTemplate('raft')}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
          >
            Raft Consensus
          </button>
          <button
            type="button"
            onClick={() => loadTemplate('limiter')}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
          >
            Rate Limiter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Submission Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Code className="w-4 h-4 text-slate-700" />
              <span>Project Information & Data Entry</span>
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleEvaluate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Distributed Key-Value Store with Raft"
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Domain / Field *
                  </label>
                  <input
                    type="text"
                    required
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="e.g. Distributed Systems"
                    className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    GitHub or Demo URL (optional)
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Technologies & Frameworks (comma-separated)
                </label>
                <input
                  type="text"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  placeholder="TypeScript, Docker, Redis, gRPC..."
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Project Description & Problem Solved *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what the system does, why it was built, and the problem it addresses..."
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Architecture & Implementation Highlights
                </label>
                <textarea
                  rows={2}
                  value={architectureDetails}
                  onChange={(e) => setArchitectureDetails(e.target.value)}
                  placeholder="e.g. Decoupled microservice layers, RPC communication protocols, persistent state stores..."
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Key Challenges Solved
                </label>
                <textarea
                  rows={2}
                  value={challengesFaced}
                  onChange={(e) => setChallengesFaced(e.target.value)}
                  placeholder="e.g. Concurrency deadlocks, network partitions, optimizing latency..."
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Analyzing Architecture with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Evaluate with PathPilot AI</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: AI Evaluation Report */}
        <div className="lg:col-span-6 space-y-6">
          {currentEvaluation ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              {/* Score Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Evaluation Report Verified</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {projectTitle}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                      Academic Score
                    </div>
                    <div className="text-3xl font-bold text-slate-900 tabular-nums">
                      {currentEvaluation.overallScore}
                      <span className="text-xs text-slate-400 font-normal"> / 100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Category Breakdown */}
              <div>
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
                  Score Breakdown (Rubric Metrics)
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-slate-600">Technical Complexity</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {currentEvaluation.scoreBreakdown.technicalComplexity} / 25
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-900 h-full rounded-full"
                        style={{ width: `${(currentEvaluation.scoreBreakdown.technicalComplexity / 25) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-slate-600">Industry Relevance</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {currentEvaluation.scoreBreakdown.industryRelevance} / 25
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-900 h-full rounded-full"
                        style={{ width: `${(currentEvaluation.scoreBreakdown.industryRelevance / 25) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-slate-600">Architecture Quality</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {currentEvaluation.scoreBreakdown.codeArchitectureQuality} / 25
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-900 h-full rounded-full"
                        style={{ width: `${(currentEvaluation.scoreBreakdown.codeArchitectureQuality / 25) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-slate-600">Innovation & Impact</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {currentEvaluation.scoreBreakdown.innovationAndImpact} / 25
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-900 h-full rounded-full"
                        style={{ width: `${(currentEvaluation.scoreBreakdown.innovationAndImpact / 25) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-lg border-l-2 border-slate-900 leading-relaxed">
                <span className="font-semibold text-slate-900 block mb-1">Evaluator Summary:</span>
                {currentEvaluation.evaluationSummary}
              </div>

              {/* Strengths & Improvements */}
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Identified Strengths</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-600">
                    {currentEvaluation.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-slate-400 mt-0.5">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Actionable Areas for Academic Improvement</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-600">
                    {currentEvaluation.areasForImprovement.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-slate-400 mt-0.5">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Next Steps Roadmap */}
              {currentEvaluation.actionableRoadmap && currentEvaluation.actionableRoadmap.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
                    3-Step Actionable Roadmap to Production Grade
                  </h4>
                  <div className="space-y-2">
                    {currentEvaluation.actionableRoadmap.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg text-xs">
                        <div className="font-semibold text-slate-900 flex items-center gap-2 mb-1">
                          <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                            {item.step}
                          </span>
                          <span>{item.task}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] pl-6 leading-relaxed">
                          {item.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Skills to Acquire */}
              {currentEvaluation.recommendedSkillsToAcquire && (
                <div className="pt-2 text-xs">
                  <span className="font-semibold text-slate-900 block mb-2">
                    Recommended Technologies to Acquire Next:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentEvaluation.recommendedSkillsToAcquire.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-slate-100 text-slate-800 text-[11px] font-medium rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Next Project */}
              {currentEvaluation.suggestedNextProject && (
                <div className="p-3.5 bg-slate-900 text-white rounded-lg text-xs">
                  <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold mb-1">
                    Recommended Next Project Step
                  </div>
                  <div className="font-bold text-white mb-1">
                    {currentEvaluation.suggestedNextProject.title}
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    {currentEvaluation.suggestedNextProject.concept}
                  </div>
                </div>
              )}

              {/* Save / Update Dashboard action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {savedSuccess ? 'Saved to dashboard & historical metrics!' : 'Save this score to update your growth records.'}
                </span>

                <button
                  type="button"
                  onClick={handleSaveToDashboard}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors"
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>{savedSuccess ? 'Updated in Dashboard' : 'Save to Dashboard'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] border border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-white">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
                <Sparkles className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                No Active Evaluation Report
              </h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-4">
                Fill in your project details on the left or use one of the quick templates, then click "Evaluate with PathPilot AI" to view your comprehensive score and improvement rubric.
              </p>
              <button
                type="button"
                onClick={() => loadTemplate('raft')}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Load Sample Raft Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
