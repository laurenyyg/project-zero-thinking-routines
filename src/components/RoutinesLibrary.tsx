import React, { useState } from 'react';
import { Search, ArrowRight, Plus } from 'lucide-react';
import {
  PZRoutine,
  PZ_ROUTINES,
  CATEGORY_CONFIG,
  PZCategory,
  PracticeLogEntry,
} from '../data/pzRoutines';

interface RoutinesLibraryProps {
  onSelectRoutineToRun: (routineId: string) => void;
  onOpenLogModal: (routineId?: string) => void;
  logs: PracticeLogEntry[];
}

export const RoutinesLibrary: React.FC<RoutinesLibraryProps> = ({
  onSelectRoutineToRun,
  onOpenLogModal,
  logs,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PZCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Count practices per routine from user's logs
  const usageCountMap: Record<string, number> = {};
  logs.forEach((log) => {
    usageCountMap[log.routineId] = (usageCountMap[log.routineId] || 0) + 1;
  });

  const filteredRoutines = PZ_ROUTINES.filter((routine) => {
    const matchesCategory = selectedCategory === 'all' || routine.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      query === '' ||
      routine.name.toLowerCase().includes(query) ||
      routine.subtitle.toLowerCase().includes(query) ||
      routine.purpose.toLowerCase().includes(query) ||
      routine.bestForTags.some((t) => t.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Category Tabs & Search Bar */}
      <div className="bg-white p-5 destijl-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider border-2 transition-all ${
              selectedCategory === 'all'
                ? 'bg-black text-white border-black shadow-[2px_2px_0px_#E52521]'
                : 'bg-white text-black border-black hover:bg-neutral-100 hover:shadow-[1px_1px_0px_#111111]'
            }`}
          >
            All Routines ({PZ_ROUTINES.length})
          </button>

          {(Object.keys(CATEGORY_CONFIG) as PZCategory[]).map((catKey) => {
            const conf = CATEGORY_CONFIG[catKey];
            const isSelected = selectedCategory === catKey;

            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 transition-all ${
                  isSelected
                    ? `${conf.bgClass} text-white border-black font-extrabold shadow-[2px_2px_0px_#111111]`
                    : 'bg-white text-black border-black hover:bg-neutral-100'
                }`}
              >
                <span>{conf.symbol}</span>
                <span>{conf.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search routine or tag..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-[#0047AB]"
          />
        </div>
      </div>

      {/* Routine Cards Grid (De Stijl Architectural Tiles) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRoutines.map((routine) => {
          const catConf = CATEGORY_CONFIG[routine.category];
          const practiceCount = usageCountMap[routine.id] || 0;

          return (
            <div
              key={routine.id}
              className="bg-white destijl-border flex flex-col justify-between hover:shadow-[4px_4px_0px_#111111] transition-shadow duration-150"
            >
              <div className="p-5 space-y-3">
                {/* Category Indicator & Practice Count */}
                <div className="flex items-center justify-between pb-2 border-b border-black">
                  <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-black">
                    <span className="text-sm font-black">{catConf.symbol}</span>
                    <span>{catConf.label}</span>
                  </span>

                  <span className="text-[11px] font-mono-numbers font-bold px-1.5 py-0.5 bg-neutral-100 border border-black">
                    {practiceCount} {practiceCount === 1 ? 'practice' : 'practices'}
                  </span>
                </div>

                {/* Routine Title */}
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider text-black">
                    {routine.name}
                  </h3>
                  <p className="text-xs text-neutral-600 mt-0.5 leading-snug italic">
                    "{routine.subtitle}"
                  </p>
                </div>

                {/* Purpose Snippet */}
                <p className="text-xs text-neutral-700 leading-relaxed line-clamp-3">
                  {routine.purpose}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 text-[10px] text-neutral-500 pt-1">
                  {routine.bestForTags.map((tag, i) => (
                    <span key={i} className="font-semibold">
                      #{tag}
                      {i < routine.bestForTags.length - 1 ? ' ·' : ''}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-3 border-t-2 border-black bg-neutral-50 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-neutral-500 font-mono-numbers">
                  {routine.steps.length} Steps
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenLogModal(routine.id)}
                    className="p-1.5 bg-white border border-black hover:bg-[#FFD000] transition-colors"
                    title="Quick log practice"
                    aria-label="Quick log practice"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onSelectRoutineToRun(routine.id)}
                    className="destijl-btn-black flex items-center gap-1 px-3 py-1 text-xs uppercase tracking-wider"
                  >
                    <span>Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
