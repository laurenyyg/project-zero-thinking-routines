import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AdvisorChat } from './components/AdvisorChat';
import { RoutinesLibrary } from './components/RoutinesLibrary';
import { PracticeDashboard } from './components/PracticeDashboard';
import { RoutineRunner } from './components/RoutineRunner';
import { LogPracticeModal } from './components/LogPracticeModal';
import {
  PracticeLogEntry,
  INITIAL_PRACTICE_LOGS,
  PZ_ROUTINES,
} from './data/pzRoutines';

export default function App() {
  const [activeTab, setActiveTab] = useState<'advisor' | 'library' | 'dashboard'>('advisor');
  const [runningRoutineId, setRunningRoutineId] = useState<string | null>(null);

  // Persistence in localStorage
  const [logs, setLogs] = useState<PracticeLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('pz_practice_logs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_PRACTICE_LOGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('pz_practice_logs', JSON.stringify(logs));
    } catch {
      // ignore
    }
  }, [logs]);

  // Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [modalPreselectedRoutineId, setModalPreselectedRoutineId] = useState<string | undefined>(undefined);
  const [modalDefaultNote, setModalDefaultNote] = useState<string | undefined>(undefined);

  const handleOpenLogModal = (routineId?: string, defaultNote?: string) => {
    setModalPreselectedRoutineId(routineId);
    setModalDefaultNote(defaultNote);
    setIsLogModalOpen(true);
  };

  const handleSaveLog = (entryData: Omit<PracticeLogEntry, 'id' | 'createdAt'>) => {
    const newEntry: PracticeLogEntry = {
      ...entryData,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    setLogs((prev) => [newEntry, ...prev]);
  };

  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const handleSelectRoutineToRun = (routineId: string) => {
    setRunningRoutineId(routineId);
  };

  const runningRoutine = runningRoutineId
    ? PZ_ROUTINES.find((r) => r.id === runningRoutineId)
    : null;

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans">
      {/* Top Bar Contract Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setRunningRoutineId(null);
        }}
        onOpenLogModal={() => handleOpenLogModal()}
        totalPractices={logs.length}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {runningRoutine ? (
          <RoutineRunner
            routine={runningRoutine}
            onBack={() => setRunningRoutineId(null)}
            onCompleteAndLog={(routineId, summaryNote) => {
              handleOpenLogModal(routineId, summaryNote);
              setRunningRoutineId(null);
            }}
          />
        ) : (
          <>
            {activeTab === 'advisor' && (
              <AdvisorChat
                onSelectRoutineToRun={handleSelectRoutineToRun}
                onOpenLogModal={(routineId, defaultNote) =>
                  handleOpenLogModal(routineId, defaultNote)
                }
              />
            )}

            {activeTab === 'library' && (
              <RoutinesLibrary
                onSelectRoutineToRun={handleSelectRoutineToRun}
                onOpenLogModal={(routineId) => handleOpenLogModal(routineId)}
                logs={logs}
              />
            )}

            {activeTab === 'dashboard' && (
              <PracticeDashboard
                logs={logs}
                onDeleteLog={handleDeleteLog}
                onOpenLogModal={(routineId) => handleOpenLogModal(routineId)}
                onSelectRoutineToRun={handleSelectRoutineToRun}
              />
            )}
          </>
        )}
      </main>

      {/* Bauhaus Architectural Footer */}
      <footer className="w-full bg-white border-t-2 border-black mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold uppercase tracking-wider text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#E52521]" />
            <span className="w-3 h-3 rounded-full bg-[#0047AB]" />
            <span className="w-3 h-3 bg-[#FFD000]" />
            <span className="w-3 h-3 bg-[#111111] rotate-45" />
            <span className="text-black ml-1">Harvard Graduate School of Education · Project Zero</span>
          </div>
          <p className="font-mono-numbers text-[11px] text-neutral-500">
            Cultures of Thinking · Visible Thinking · Agency by Design
          </p>
        </div>
      </footer>

      {/* Quick Logging Modal */}
      <LogPracticeModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSave={handleSaveLog}
        preselectedRoutineId={modalPreselectedRoutineId}
        defaultNote={modalDefaultNote}
      />
    </div>
  );
}
