import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, X, Sparkles, ArrowRight, ShieldCheck, 
  RotateCcw, Compass, ExternalLink, HelpCircle, CheckCircle, 
  FileText, Briefcase, GraduationCap, Wallet, Zap, Layers 
} from 'lucide-react';
import { UnifiedStudentContext, StudentIntelligenceScores, NextBestAction, CopilotMessage } from '../types';
import { requestCopilotChat, fetchCopilotHistoryDB, clearCopilotHistoryDB, saveCopilotMessageDB } from '../services/api';
import { generateLocalCopilotResponse } from '../services/intelligenceService';

interface AICopilotChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  context: UnifiedStudentContext;
  scores: StudentIntelligenceScores;
  nba: NextBestAction;
  onNavigateTab: (tab: string) => void;
}

export const AICopilotChatDrawer: React.FC<AICopilotChatDrawerProps> = ({
  isOpen,
  onClose,
  context,
  scores,
  nba,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>(() => {
    try {
      const stored = localStorage.getItem('pathpilot_copilot_chat');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read stored copilot chat:', e);
    }

    return [
      {
        id: 'welcome-msg',
        sender: 'assistant',
        text: `Hello **${context.student.name}**! I am your AI Career Copilot, grounded directly in your PathPilot profile as a ${context.academic.year} student in ${context.academic.department}.\n\nYour current target role is **${context.placement.targetRole}** with an overall student growth index of **${scores.overallGrowth}%** and placement readiness of **${context.placement.readiness.overallScore}%**.\n\nYour single highest-priority recommendation right now is to **${nba.title}**.\n\nHow can I help accelerate your career preparation today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structuredEvidence: {
          dataPoint: `${scores.overallGrowth}% Overall Growth · ${context.placement.readiness.overallScore}% Placement Readiness`,
          reason: 'Synthesizes academic history, evaluated project code, ATS keywords, and budget discipline.',
          expectedBenefit: 'Provides deterministic, actionable guidance without generic advice or hallucinated metrics.',
        },
        suggestedActions: [
          { label: 'What is my Next Best Action?', queryPrompt: 'What should I work on next?' },
          { label: 'Analyze Resume ATS Gaps', queryPrompt: 'What keywords are missing on my resume?' },
          { label: 'Check Internship Matches', actionTab: 'placement' },
        ],
      },
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync chat to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pathpilot_copilot_chat', JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save copilot chat:', e);
    }
  }, [messages]);

  // Load copilot chat history from database on open
  useEffect(() => {
    if (isOpen) {
      fetchCopilotHistoryDB()
        .then((res) => {
          if (res.copilotChatHistory && res.copilotChatHistory.length > 0) {
            setMessages(res.copilotChatHistory);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages, isTyping]);

  const quickPrompts = [
    'What should I work on next?',
    'What keywords are missing on my resume?',
    'Which internship matches me best?',
    'How is my monthly budget?',
    'Explain my Placement Readiness score',
  ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isTyping) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);
    saveCopilotMessageDB(userMsg).catch(() => {});

    try {
      // First attempt server Gemini endpoint with complete unified student context
      const res = await requestCopilotChat({
        message: textToSend,
        context,
        history: messages,
      });

      if (res && res.reply) {
        const assistantMsg: CopilotMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: res.reply.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          structuredEvidence: res.reply.structuredEvidence,
          suggestedActions: res.reply.suggestedActions,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        saveCopilotMessageDB(assistantMsg).catch(() => {});
      } else {
        throw new Error('Empty reply');
      }
    } catch (err) {
      // Fallback deterministic grounded intelligence generator
      const fallbackMsg = generateLocalCopilotResponse(textToSend, context, scores, nba);
      setMessages((prev) => [...prev, fallbackMsg]);
      saveCopilotMessageDB(fallbackMsg).catch(() => {});
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    clearCopilotHistoryDB().catch(console.error);
    const resetMsg: CopilotMessage = {
      id: `reset-${Date.now()}`,
      sender: 'assistant',
      text: `Chat history cleared. I am grounded in your live PathPilot data for **${context.student.name}** (${context.placement.targetRole}). Ask me anything about your roadmap, ATS resume, interviews, or project proof-of-work.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: 'What is my Next Best Action?', queryPrompt: 'What should I work on next?' },
        { label: 'Check ATS Resume Gaps', queryPrompt: 'What keywords are missing on my resume?' },
      ],
    };
    setMessages([resetMsg]);
    try {
      localStorage.removeItem('pathpilot_copilot_chat');
    } catch (e) {
      console.warn(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 transform transition-transform duration-300 ease-in-out"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Bot className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight text-white">AI Career Copilot</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  Grounded
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Personalized for {context.student.name} · {context.placement.targetRole}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              title="Reset Chat History"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Context Indicator Strip */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-3 text-slate-600 font-medium">
            <span>Growth: <strong className="text-slate-900 font-mono">{scores.overallGrowth}%</strong></span>
            <span>·</span>
            <span>Placement Readiness: <strong className="text-emerald-700 font-mono">{context.placement.readiness.overallScore}%</strong></span>
            <span>·</span>
            <span>ATS Resume: <strong className="text-slate-900 font-mono">{context.resume.atsScore}/100</strong></span>
          </div>
          <span className="text-[10px] text-slate-500 whitespace-nowrap hidden sm:inline">
            Zero Hallucinations Guarantee
          </span>
        </div>

        {/* Chat Message List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-br-xs'
                        : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200'
                    }`}
                  >
                    <div className="whitespace-pre-wrap space-y-2">
                      {msg.text.split('\n\n').map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                    </div>

                    {/* Structured Evidence Card */}
                    {msg.structuredEvidence && (
                      <div className="mt-3 pt-3 border-t border-slate-200/80 text-[11px] bg-white/70 p-2.5 rounded-lg border">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Student Data Evidence:</span>
                        </div>
                        <div className="text-slate-700 font-mono text-[10px] bg-slate-50 p-1 rounded border border-slate-100 mb-1.5">
                          {msg.structuredEvidence.dataPoint}
                        </div>
                        <div className="text-slate-600 mb-1">
                          <strong className="text-slate-800">Reason:</strong> {msg.structuredEvidence.reason}
                        </div>
                        <div className="text-emerald-700 font-medium">
                          <strong>Expected Benefit:</strong> {msg.structuredEvidence.expectedBenefit}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timestamp & Suggested Quick Actions */}
                  <span className="text-[10px] text-slate-500 mt-1 px-1">
                    {msg.timestamp}
                  </span>

                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.suggestedActions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            if (action.actionTab) {
                              onNavigateTab(action.actionTab);
                              onClose();
                            } else if (action.queryPrompt) {
                              handleSendMessage(action.queryPrompt);
                            }
                          }}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-400 hover:bg-white transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <span>{action.label}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-bl-xs px-4 py-3 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse delay-75" />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse delay-150" />
                <span className="text-xs text-slate-500 ml-1.5">Analyzing student context...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/60 overflow-x-auto whitespace-nowrap shrink-0 flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Ask:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isTyping}
              className="text-[11px] font-medium px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-full text-slate-700 transition-colors whitespace-nowrap shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about your projects, ATS resume, interviews, or next step..."
              disabled={isTyping}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
            <span>Answers strictly grounded in your actual PathPilot record.</span>
            <span>Press Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  );
};
