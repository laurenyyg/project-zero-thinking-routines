import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { PZRoutine, PZ_ROUTINES, CATEGORY_CONFIG } from '../data/pzRoutines';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendedRoutineId?: string;
}

interface AdvisorChatProps {
  onSelectRoutineToRun: (routineId: string) => void;
  onOpenLogModal: (routineId?: string, defaultNote?: string) => void;
}

const QUICK_DIAGNOSTIC_PROMPTS = [
  {
    label: 'Reflect on a book or chapter',
    context: 'We just finished reading a chapter and I want students to reflect on how their thinking shifted.',
    hintRoutineId: '3-2-1-bridge',
  },
  {
    label: 'Examine a contentious debate or claim',
    context: 'Students are debating a controversial topic and need to substantiate their views with real evidence.',
    hintRoutineId: 'claim-support-question',
  },
  {
    label: 'Evaluate a difficult proposition / decision',
    context: 'We have a tough choice with trade-offs and need to explore pros, worries, and what info is missing.',
    hintRoutineId: 'compass-points',
  },
  {
    label: 'Slowly observe an artwork or primary source',
    context: 'I am introducing a historical artifact or visual piece and want to spark inquiry without jumping to assumptions.',
    hintRoutineId: 'see-think-wonder',
  },
  {
    label: 'Collaborative note-taking after a lecture',
    context: 'I want an active alternative to passive note-taking that lets students recall key ideas and build on each other.',
    hintRoutineId: 'plus-1-routine',
  },
  {
    label: 'Analyze a complex human or civic system',
    context: 'We are mapping out how an institution or community system functions and how changing one piece impacts people.',
    hintRoutineId: 'parts-people-interactions',
  },
];

export const AdvisorChat: React.FC<AdvisorChatProps> = ({
  onSelectRoutineToRun,
  onOpenLogModal,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Welcome! I am your Harvard Project Zero (PZ) Educational Consultant. Describe what task, lesson, inquiry, or challenge you or your learners are tackling. I will diagnose the core thinking move you need and recommend the exact routine from the PZ toolbox with step-by-step facilitation guidance.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string, routineHintId?: string) => {
    const userText = textToSend || input;
    if (!userText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/pz-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userTaskContext: userText,
        }),
      });

      if (!response.ok) {
        throw new Error(`Advisor service returned status ${response.status}`);
      }

      const data = await response.json();
      
      // Look for any routine mention to link directly
      let matchedRoutineId = data.recommendedRoutineId || routineHintId;
      if (!matchedRoutineId) {
        const found = PZ_ROUTINES.find((r) =>
          data.reply.toLowerCase().includes(r.name.toLowerCase())
        );
        if (found) matchedRoutineId = found.id;
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        recommendedRoutineId: matchedRoutineId,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      // Fallback response with concrete PZ guidance
      const fallbackRoutine = PZ_ROUTINES.find((r) => r.id === routineHintId) || PZ_ROUTINES[0];
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-fallback-${Date.now()}`,
          role: 'assistant',
          content: `Based on your goal, the Harvard Project Zero **${fallbackRoutine.name}** routine is ideal.\n\n**Purpose:** ${fallbackRoutine.purpose}\n\n**Application:** ${fallbackRoutine.application}\n\n**Step-by-step facilitation:**\n${fallbackRoutine.steps
            .map((s, idx) => `${idx + 1}. **${s.title}**: ${s.prompt}`)
            .join('\n')}`,
          recommendedRoutineId: fallbackRoutine.id,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          'Welcome back! Describe your current task or learning objective. I will recommend the most appropriate Harvard Project Zero thinking routine and guide you through its structured steps.',
      },
    ]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Diagnostic Quick Triggers (4 Cols) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="p-4 bg-white destijl-border">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black mb-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-black">
              Diagnostic Scenarios
            </span>
            <span className="text-[10px] font-bold uppercase text-neutral-500">Quick Start</span>
          </div>
          <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
            Click any scenario to ask for a tailored Harvard Project Zero recommendation:
          </p>
          <div className="space-y-2">
            {QUICK_DIAGNOSTIC_PROMPTS.map((prompt, idx) => {
              const routine = PZ_ROUTINES.find((r) => r.id === prompt.hintRoutineId);
              const catConf = routine ? CATEGORY_CONFIG[routine.category] : CATEGORY_CONFIG.synthesizing;

              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt.context, prompt.hintRoutineId)}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 bg-neutral-50 hover:bg-white border-2 border-black text-xs font-medium transition-all hover:shadow-[2px_2px_0px_#111111] group disabled:opacity-50"
                >
                  <div className="flex items-center gap-1.5 font-bold text-black uppercase mb-1">
                    <span>{catConf.symbol}</span>
                    <span className="group-hover:text-[#0047AB] transition-colors">
                      {prompt.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 line-clamp-2 leading-snug">
                    {prompt.context}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Harvard Project Zero Principle Card */}
        <div className="p-4 bg-neutral-100 destijl-border text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-black">
            <div className="w-2.5 h-2.5 bg-[#E52521]" />
            <span>Project Zero Methodology</span>
          </div>
          <p className="text-neutral-700 leading-relaxed">
            Thinking routines are lightweight, micro-patterns of thought developed at the Harvard Graduate School of Education. Used repeatedly, they become natural habits of mind for students and teams.
          </p>
        </div>
      </div>

      {/* Main Chat Interface (8 Cols) */}
      <div className="lg:col-span-8 flex flex-col h-[650px] bg-white destijl-border">
        {/* Chat Header */}
        <div className="p-3.5 border-b-2 border-black bg-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#0047AB]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-black">
              Interactive Diagnostic Consultant
            </h2>
          </div>
          <button
            onClick={handleResetChat}
            className="flex items-center gap-1 text-[11px] font-bold text-neutral-600 hover:text-black uppercase"
            title="Start new conversation"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            const matchedRoutine = message.recommendedRoutineId
              ? PZ_ROUTINES.find((r) => r.id === message.recommendedRoutineId)
              : null;

            return (
              <div
                key={message.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                {/* Sender badge */}
                <span className="text-[10px] font-mono-numbers font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  {isUser ? 'You (Practitioner)' : 'Project Zero Advisor'}
                </span>

                {/* Message Body */}
                <div
                  className={`max-w-[90%] p-4 text-xs sm:text-sm leading-relaxed border-2 border-black ${
                    isUser
                      ? 'bg-neutral-50 border-l-[4px] border-l-[#E52521] text-neutral-900 font-medium'
                      : 'bg-white shadow-[2px_2px_0px_#111111]'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{message.content}</div>

                  {/* If assistant identified a specific routine, show the routine action card */}
                  {!isUser && matchedRoutine && (
                    <div className="mt-4 pt-3 border-t-2 border-black bg-neutral-50 p-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black">
                            {CATEGORY_CONFIG[matchedRoutine.category].symbol}
                          </span>
                          <span className="font-extrabold uppercase text-xs tracking-wider text-black">
                            {matchedRoutine.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase text-neutral-500">
                          {matchedRoutine.categoryLabel}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-700 mb-3 italic">
                        "{matchedRoutine.subtitle}"
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          onClick={() => onSelectRoutineToRun(matchedRoutine.id)}
                          className="destijl-btn-black flex items-center gap-1 px-3 py-1.5 text-xs uppercase tracking-wider"
                        >
                          <span>Step-by-Step Guide</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() =>
                            onOpenLogModal(
                              matchedRoutine.id,
                              'Followed recommendation from interactive advisor'
                            )
                          }
                          className="destijl-btn-yellow flex items-center gap-1 px-3 py-1.5 text-xs uppercase tracking-wider"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Log Practice</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-mono-numbers font-bold uppercase text-neutral-500 mb-1">
                Project Zero Advisor
              </span>
              <div className="p-3 bg-neutral-100 border-2 border-black flex items-center gap-2 text-xs font-bold text-neutral-700">
                <div className="w-2 h-2 bg-[#0047AB] animate-ping" />
                <span>Diagnosing learning goals & consulting PZ toolbox...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t-2 border-black bg-neutral-100 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Type your teaching goal, student problem, or inquiry topic..."
            className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#0047AB] disabled:bg-neutral-200"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="destijl-btn-black flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider disabled:opacity-50"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
