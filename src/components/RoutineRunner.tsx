import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, Download, BookOpen, Lightbulb } from 'lucide-react';
import { PZRoutine, CATEGORY_CONFIG } from '../data/pzRoutines';

interface RoutineRunnerProps {
  routine: PZRoutine;
  onBack: () => void;
  onCompleteAndLog: (routineId: string, summaryNote: string) => void;
}

export const RoutineRunner: React.FC<RoutineRunnerProps> = ({
  routine,
  onBack,
  onCompleteAndLog,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [stepInputs, setStepInputs] = useState<Record<number, string>>({});
  const [sessionTopic, setSessionTopic] = useState('');

  const catConfig = CATEGORY_CONFIG[routine.category];

  const handleInputChange = (stepIdx: number, val: string) => {
    setStepInputs((prev) => ({ ...prev, [stepIdx]: val }));
  };

  const currentStep = routine.steps[activeStepIndex];

  const handleFinishAndLog = () => {
    const summary = sessionTopic.trim()
      ? `${sessionTopic.trim()}`
      : `Practiced ${routine.name} with ${Object.keys(stepInputs).length} completed steps`;
    onCompleteAndLog(routine.id, summary);
  };

  const handleExportSession = () => {
    const lines = [
      `# Harvard Project Zero Session: ${routine.name}`,
      `**Category:** ${catConfig.label}`,
      `**Topic/Context:** ${sessionTopic || 'Untitled Inquiry'}`,
      `**Date:** ${new Date().toLocaleDateString()}`,
      '',
      `## Purpose`,
      routine.purpose,
      '',
      `## Step-by-Step Responses`,
      ...routine.steps.map((step, idx) => {
        const text = stepInputs[idx] || '*(No response recorded)*';
        return `### Step ${idx + 1}: ${step.title}\n> ${step.prompt}\n\n${text}\n`;
      }),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${routine.id}-session-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Breadcrumb */}
      <div className="p-5 bg-white destijl-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black mb-1 flex items-center gap-1"
          >
            ← Back to All Routines
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black">{catConfig.symbol}</span>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-black">
              {routine.name}
            </h1>
          </div>
          <p className="text-xs text-neutral-600 mt-0.5 italic">
            "{routine.subtitle}"
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportSession}
            className="destijl-btn-white flex items-center gap-1 px-3 py-1.5 text-xs uppercase tracking-wider"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Notes</span>
          </button>
          <button
            onClick={handleFinishAndLog}
            className="destijl-btn-yellow flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Log Practice</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Overview & Interactive Step-by-Step Worksheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Purpose, Application & Steps Navigation (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Inquiry Context / Topic */}
          <div className="p-4 bg-white destijl-border">
            <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
              Your Inquiry Topic / Subject:
            </label>
            <input
              type="text"
              value={sessionTopic}
              onChange={(e) => setSessionTopic(e.target.value)}
              placeholder="e.g., Hamlet Soliloquy, Renewable Energy debate..."
              className="w-full px-3 py-1.5 text-xs border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB]"
            />
          </div>

          {/* Sequential Steps Navigation */}
          <div className="p-4 bg-white destijl-border space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-black block pb-2 border-b-2 border-black">
              Routine Steps ({routine.steps.length})
            </span>
            <div className="space-y-1.5 pt-1">
              {routine.steps.map((step, idx) => {
                const isCurrent = activeStepIndex === idx;
                const hasInput = !!(stepInputs[idx] && stepInputs[idx].trim().length > 0);

                return (
                  <button
                    key={idx}
                    onClick={() => setActiveStepIndex(idx)}
                    className={`w-full p-2.5 text-left text-xs font-bold uppercase border-2 flex items-center justify-between transition-all ${
                      isCurrent
                        ? 'bg-black text-white border-black shadow-[2px_2px_0px_#E52521]'
                        : hasInput
                        ? 'bg-neutral-100 text-black border-black'
                        : 'bg-white text-neutral-800 border-neutral-300 hover:border-black'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono-numbers">{idx + 1}.</span>
                      <span className="line-clamp-1">{step.title}</span>
                    </div>
                    {hasInput && (
                      <span className="text-[10px] px-1 bg-green-200 text-black border border-black">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Official Harvard PZ Guidance */}
          <div className="p-4 bg-neutral-50 destijl-border text-xs space-y-3">
            <div>
              <span className="font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#0047AB]" />
                <span>Purpose</span>
              </span>
              <p className="text-neutral-700 mt-1 leading-relaxed">{routine.purpose}</p>
            </div>

            <div className="pt-2 border-t border-black">
              <span className="font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-[#B28900]" />
                <span>When and where can I use it?</span>
              </span>
              <p className="text-neutral-700 mt-1 leading-relaxed">{routine.application}</p>
            </div>

            {routine.launchTip && (
              <div className="pt-2 border-t border-black">
                <span className="font-bold uppercase tracking-wider text-black">
                  Facilitator Launch Tip:
                </span>
                <p className="text-neutral-700 mt-1 leading-relaxed italic">{routine.launchTip}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Step Interactive Workspace (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col bg-white destijl-border p-6 justify-between space-y-6">
          <div className="space-y-4">
            {/* Step header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-black text-white flex items-center justify-center font-mono-numbers text-xs font-bold">
                  {activeStepIndex + 1}
                </span>
                <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black">
                  {currentStep.title}
                </h2>
              </div>
              <span className="text-xs font-mono-numbers text-neutral-500 font-bold">
                Step {activeStepIndex + 1} of {routine.steps.length}
              </span>
            </div>

            {/* Prompt Box */}
            <div className="p-4 bg-neutral-100 border-2 border-black">
              <span className="block text-[11px] font-extrabold uppercase tracking-widest text-[#0047AB] mb-1">
                Thinking Prompt:
              </span>
              <p className="text-sm font-bold text-black leading-snug">
                {currentStep.prompt}
              </p>
              {currentStep.guidance && (
                <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
                  {currentStep.guidance}
                </p>
              )}
            </div>

            {/* Reflection Notepad */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5">
                Record your thoughts / student responses:
              </label>
              <textarea
                rows={8}
                value={stepInputs[activeStepIndex] || ''}
                onChange={(e) => handleInputChange(activeStepIndex, e.target.value)}
                placeholder="Jot down notes, observations, student answers, or your own thinking moves..."
                className="w-full p-3.5 text-xs sm:text-sm border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB] font-sans leading-relaxed"
              />
            </div>
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-black">
            <button
              onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeStepIndex === 0}
              className="destijl-btn-white px-4 py-2 text-xs uppercase tracking-wider disabled:opacity-40"
            >
              ← Previous Step
            </button>

            <div className="flex items-center gap-3">
              {activeStepIndex < routine.steps.length - 1 ? (
                <button
                  onClick={() => setActiveStepIndex((prev) => Math.min(routine.steps.length - 1, prev + 1))}
                  className="destijl-btn-black flex items-center gap-1.5 px-5 py-2 text-xs uppercase tracking-wider"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinishAndLog}
                  className="destijl-btn-yellow flex items-center gap-1.5 px-6 py-2 text-xs uppercase tracking-wider"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Complete & Log Routine</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
