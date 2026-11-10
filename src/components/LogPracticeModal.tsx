import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { PZRoutine, PZ_ROUTINES, CATEGORY_CONFIG, PracticeLogEntry } from '../data/pzRoutines';
import confetti from 'canvas-confetti';

interface LogPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<PracticeLogEntry, 'id' | 'createdAt'>) => void;
  preselectedRoutineId?: string;
  defaultNote?: string;
}

export const LogPracticeModal: React.FC<LogPracticeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  preselectedRoutineId,
  defaultNote = '',
}) => {
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(
    preselectedRoutineId || PZ_ROUTINES[0].id
  );
  const [date, setDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [note, setNote] = useState<string>(defaultNote);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedRoutineId) {
      setSelectedRoutineId(preselectedRoutineId);
    }
    if (defaultNote) {
      setNote(defaultNote);
    }
  }, [preselectedRoutineId, defaultNote, isOpen]);

  if (!isOpen) return null;

  const currentRoutine = PZ_ROUTINES.find((r) => r.id === selectedRoutineId) || PZ_ROUTINES[0];
  const categoryConfig = CATEGORY_CONFIG[currentRoutine.category];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      setError('Please provide a short note (e.g., "for chapter 3 analysis" or "for team retrospective").');
      return;
    }

    onSave({
      routineId: currentRoutine.id,
      routineName: currentRoutine.name,
      category: currentRoutine.category,
      date,
      note: note.trim(),
    });

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#E52521', '#0047AB', '#FFD000', '#111111'],
      });
    } catch {
      // safe fallback
    }

    setNote('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white destijl-border-thick shadow-[8px_8px_0px_#111111] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-black bg-neutral-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black">{categoryConfig.symbol}</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-black">
              Confirm & Log Thinking Routine
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-200 border border-transparent hover:border-black transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Routine Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
              Select Thinking Routine
            </label>
            <select
              value={selectedRoutineId}
              onChange={(e) => setSelectedRoutineId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border-2 border-black font-medium focus:outline-none focus:ring-2 focus:ring-[#0047AB]"
            >
              {PZ_ROUTINES.map((routine) => (
                <option key={routine.id} value={routine.id}>
                  {routine.name} ({routine.categoryLabel})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
              Date of Practice
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border-2 border-black font-mono-numbers focus:outline-none focus:ring-2 focus:ring-[#0047AB]"
              required
            />
          </div>

          {/* Custom Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-800 mb-1">
              Context / Custom Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (error) setError(null);
              }}
              placeholder='e.g., a book note on Chapter 4, physics lab prep, team decision'
              className="w-full px-3 py-2 text-sm bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#0047AB]"
            />
            {error && (
              <p className="mt-1 text-xs font-bold text-[#E52521]">{error}</p>
            )}
          </div>

          {/* Live Preview in Standard Harvard PZ Format */}
          <div className="p-3 bg-neutral-50 border-2 border-black border-dashed">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
              Live Log Preview:
            </span>
            <p className="text-xs font-semibold text-neutral-900 italic">
              "Used {currentRoutine.name} on {date} for {note.trim() ? note.trim() : '[short note]'}"
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="destijl-btn-white px-4 py-2 text-xs uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="destijl-btn-yellow flex items-center gap-1.5 px-5 py-2 text-xs uppercase tracking-wider"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Confirm & Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
