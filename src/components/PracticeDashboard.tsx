import React, { useState } from 'react';
import { Trash2, Download, Search, Sparkles } from 'lucide-react';
import {
  PracticeLogEntry,
  CATEGORY_CONFIG,
  PZCategory,
  PZ_ROUTINES,
} from '../data/pzRoutines';

interface PracticeDashboardProps {
  logs: PracticeLogEntry[];
  onDeleteLog: (id: string) => void;
  onOpenLogModal: (routineId?: string) => void;
  onSelectRoutineToRun: (routineId: string) => void;
}

export const PracticeDashboard: React.FC<PracticeDashboardProps> = ({
  logs,
  onDeleteLog,
  onOpenLogModal,
  onSelectRoutineToRun,
}) => {
  const [filterCategory, setFilterCategory] = useState<PZCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate statistics
  const totalCount = logs.length;

  const categoryCounts: Record<PZCategory, number> = {
    synthesizing: 0,
    truth_evidence: 0,
    creativity_options: 0,
    systems_complexity: 0,
  };

  const routineCounts: Record<string, { count: number; name: string; category: PZCategory }> = {};

  logs.forEach((log) => {
    if (categoryCounts[log.category] !== undefined) {
      categoryCounts[log.category] += 1;
    }
    if (!routineCounts[log.routineId]) {
      routineCounts[log.routineId] = {
        count: 0,
        name: log.routineName,
        category: log.category,
      };
    }
    routineCounts[log.routineId].count += 1;
  });

  // Top Frequent Practices (sorted)
  const topRoutines = Object.entries(routineCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  // Proportional percentages for the De Stijl breakdown bar
  const synthPercent = totalCount > 0 ? (categoryCounts.synthesizing / totalCount) * 100 : 25;
  const truthPercent = totalCount > 0 ? (categoryCounts.truth_evidence / totalCount) * 100 : 25;
  const creatPercent = totalCount > 0 ? (categoryCounts.creativity_options / totalCount) * 100 : 25;
  const complexPercent = totalCount > 0 ? (categoryCounts.systems_complexity / totalCount) * 100 : 25;

  // Filtered Activity Logs
  const filteredLogs = logs
    .filter((log) => {
      const matchesCat = filterCategory === 'all' || log.category === filterCategory;
      const matchesSearch =
        searchQuery === '' ||
        log.routineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.note.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt);

  // Export logs as Markdown file
  const handleExportMarkdown = () => {
    const lines = [
      '# Harvard Project Zero - Practice History Log',
      `*Exported on ${new Date().toLocaleDateString()} · Total Practices: ${totalCount}*\n`,
      '| Date | Thinking Routine | Category | Notes |',
      '| :--- | :--- | :--- | :--- |',
      ...logs.map(
        (l) => `| ${l.date} | ${l.routineName} | ${CATEGORY_CONFIG[l.category].label} | ${l.note.replace(/\|/g, '-')} |`
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pz-thinking-routine-log-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* 4 Suprematist Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.keys(CATEGORY_CONFIG) as PZCategory[]).map((catKey) => {
          const config = CATEGORY_CONFIG[catKey];
          const count = categoryCounts[catKey];
          const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
          const isSelected = filterCategory === catKey;

          return (
            <button
              key={catKey}
              onClick={() => setFilterCategory(isSelected ? 'all' : catKey)}
              className={`p-4 bg-white destijl-border text-left transition-all ${
                isSelected
                  ? 'ring-2 ring-black shadow-[4px_4px_0px_#111111] translate-x-[-2px] translate-y-[-2px]'
                  : 'hover:shadow-[2px_2px_0px_#111111]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-600">
                  {config.shape}
                </span>
                <span className={`text-xl ${config.textClass}`}>{config.symbol}</span>
              </div>

              {/* Graphic Emblem */}
              <div className="my-2 h-7 flex items-center">
                {config.shape === 'square' && (
                  <div className="w-6 h-6 bg-[#E52521] border border-black" />
                )}
                {config.shape === 'circle' && (
                  <div className="w-6 h-6 rounded-full bg-[#0047AB] border border-black" />
                )}
                {config.shape === 'triangle' && (
                  <div
                    className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[22px] border-b-[#FFD000]"
                    style={{ filter: 'drop-shadow(0 0 1px #111111)' }}
                  />
                )}
                {config.shape === 'diamond' && (
                  <div className="w-5 h-5 bg-[#111111] rotate-45" />
                )}
              </div>

              <div className="mt-2">
                <p className="text-2xl font-black font-mono-numbers text-black leading-none">
                  {count}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-800 mt-1 line-clamp-1">
                  {config.label}
                </p>
                <p className="text-[10px] text-neutral-500 font-mono-numbers mt-0.5">
                  {percent}% of practices
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* De Stijl Primary Distribution Bar */}
      <div className="bg-white p-5 destijl-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-black">
            Practice Distribution by Dimension
          </h2>
          <span className="text-xs font-mono-numbers font-semibold text-neutral-600">
            Total Logged: {totalCount}
          </span>
        </div>

        {/* Proportional color bar */}
        <div className="w-full h-5 border-2 border-black flex overflow-hidden">
          <div
            style={{ width: `${synthPercent}%` }}
            className="bg-[#E52521] h-full border-r border-black"
            title={`Synthesizing: ${categoryCounts.synthesizing} (${Math.round(synthPercent)}%)`}
          />
          <div
            style={{ width: `${truthPercent}%` }}
            className="bg-[#0047AB] h-full border-r border-black"
            title={`Truth & Evidence: ${categoryCounts.truth_evidence} (${Math.round(truthPercent)}%)`}
          />
          <div
            style={{ width: `${creatPercent}%` }}
            className="bg-[#FFD000] h-full border-r border-black"
            title={`Creativity & Options: ${categoryCounts.creativity_options} (${Math.round(creatPercent)}%)`}
          />
          <div
            style={{ width: `${complexPercent}%` }}
            className="bg-[#111111] h-full"
            title={`Systems & Complexity: ${categoryCounts.systems_complexity} (${Math.round(complexPercent)}%)`}
          />
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-neutral-700">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#E52521] border border-black" />
            Synthesizing ({categoryCounts.synthesizing})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#0047AB] border border-black" />
            Truth & Evidence ({categoryCounts.truth_evidence})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#FFD000] border border-black" />
            Creativity ({categoryCounts.creativity_options})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#111111]" />
            Complexity ({categoryCounts.systems_complexity})
          </span>
        </div>
      </div>

      {/* Two Column Layout: Top Frequent Practices & Activity History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Frequent Practices */}
        <div className="bg-white p-5 destijl-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-black">
                Top Frequent Practices
              </h2>
              <Sparkles className="w-4 h-4 text-neutral-600" />
            </div>

            {topRoutines.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center">
                No routines logged yet. Start a session or log your first thinking routine above.
              </p>
            ) : (
              <div className="space-y-3">
                {topRoutines.map(([routineId, data], index) => {
                  const catConfig = CATEGORY_CONFIG[data.category];
                  const percentage = totalCount > 0 ? Math.round((data.count / totalCount) * 100) : 0;

                  return (
                    <div
                      key={routineId}
                      className="p-3 border-2 border-black bg-neutral-50 hover:bg-white transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 flex items-center justify-center font-black text-xs bg-black text-white font-mono-numbers">
                            {index + 1}
                          </span>
                          <span className="text-xs font-bold text-black uppercase">
                            {data.name}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold font-mono-numbers">
                          {data.count}x ({percentage}%)
                        </span>
                      </div>

                      <div className="w-full bg-neutral-200 h-2 border border-black overflow-hidden mt-2">
                        <div
                          className={`h-full ${catConfig.bgClass}`}
                          style={{ width: `${Math.min(100, (data.count / (topRoutines[0][1].count || 1)) * 100)}%` }}
                        />
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-[11px]">
                        <span className="text-neutral-500 font-semibold">{catConfig.label}</span>
                        <button
                          onClick={() => onSelectRoutineToRun(routineId)}
                          className="font-bold underline hover:text-[#0047AB]"
                        >
                          Open Guide →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t-2 border-black">
            <button
              onClick={() => onOpenLogModal()}
              className="w-full destijl-btn-yellow py-2 text-xs uppercase tracking-wider text-center"
            >
              + Quick Log A New Practice
            </button>
          </div>
        </div>

        {/* Activity Log / History */}
        <div className="lg:col-span-2 bg-white p-5 destijl-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b-2 border-black mb-4">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-black">
                Activity Log & Practice History
              </h2>
              <p className="text-xs text-neutral-600 mt-0.5">
                Chronological record of completed thinking routine sessions
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportMarkdown}
                title="Export practice log to Markdown"
                className="destijl-btn-white flex items-center gap-1 px-3 py-1.5 text-xs uppercase tracking-wider"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export MD</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes or routines..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB]"
              />
            </div>

            <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase border-2 ${
                  filterCategory === 'all'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-black hover:bg-neutral-100'
                }`}
              >
                All
              </button>
              {(Object.keys(CATEGORY_CONFIG) as PZCategory[]).map((cKey) => {
                const conf = CATEGORY_CONFIG[cKey];
                return (
                  <button
                    key={cKey}
                    onClick={() => setFilterCategory(cKey)}
                    className={`px-2.5 py-1 text-[11px] font-bold uppercase border-2 flex items-center gap-1 ${
                      filterCategory === cKey
                        ? `${conf.bgClass} text-white border-black font-extrabold`
                        : 'bg-white text-black border-black hover:bg-neutral-100'
                    }`}
                  >
                    <span>{conf.symbol}</span>
                    <span className="hidden sm:inline">{conf.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Log Entries List */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center border-2 border-black border-dashed">
                <p className="text-xs font-semibold text-neutral-600 uppercase">
                  No records matching the filter.
                </p>
                <button
                  onClick={() => {
                    setFilterCategory('all');
                    setSearchQuery('');
                  }}
                  className="mt-2 text-xs font-bold underline hover:text-[#E52521]"
                >
                  Clear search filters
                </button>
              </div>
            ) : (
              filteredLogs.map((entry) => {
                const catConf = CATEGORY_CONFIG[entry.category] || CATEGORY_CONFIG.synthesizing;
                const routineObj = PZ_ROUTINES.find((r) => r.id === entry.routineId);

                return (
                  <div
                    key={entry.id}
                    className="p-3.5 bg-white border-2 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:shadow-[2px_2px_0px_#111111] transition-shadow"
                  >
                    <div className="space-y-1 flex-1">
                      {/* Routine Name & Date Badge */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-black uppercase text-black">
                          <span>{catConf.symbol}</span>
                          <span>{entry.routineName}</span>
                        </span>
                        <span className="font-mono-numbers text-[11px] px-1.5 py-0.5 bg-neutral-100 border border-black font-semibold text-neutral-800">
                          {entry.date}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-neutral-500">
                          {catConf.label}
                        </span>
                      </div>

                      {/* Explicit Harvard PZ Format Note */}
                      <p className="text-xs text-neutral-900 leading-relaxed font-medium">
                        <span className="font-semibold text-neutral-500">Record: </span>
                        Used <strong className="font-bold">{entry.routineName}</strong> on{' '}
                        <span className="font-mono-numbers">{entry.date}</span> for {entry.note}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {routineObj && (
                        <button
                          onClick={() => onSelectRoutineToRun(entry.routineId)}
                          className="px-2.5 py-1 text-[11px] font-bold uppercase border border-black bg-white hover:bg-neutral-100 transition-colors"
                        >
                          Guide
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteLog(entry.id)}
                        className="p-1.5 text-neutral-500 hover:text-[#E52521] hover:bg-red-50 border border-transparent hover:border-black transition-colors"
                        title="Delete log entry"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
