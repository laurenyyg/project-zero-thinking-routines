import React from 'react';
import { Plus, BookOpen, Compass, BarChart2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'advisor' | 'library' | 'dashboard';
  setActiveTab: (tab: 'advisor' | 'library' | 'dashboard') => void;
  onOpenLogModal: () => void;
  totalPractices: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenLogModal,
  totalPractices,
}) => {
  return (
    <header className="w-full bg-white border-b-2 border-black sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Zone: Bauhaus / De Stijl PZ Monogram */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-11 h-11 bg-black flex items-center justify-center font-black text-white text-lg tracking-tight select-none">
            <span>PZ</span>
            {/* De Stijl Red accent square */}
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#E52521] border border-black" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold uppercase tracking-wider text-black leading-none">
              Harvard Project Zero
            </h1>
            <p className="text-xs uppercase tracking-widest text-neutral-600 font-semibold mt-1">
              Thinking Routines Explorer & Practice Tracker
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('advisor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border-2 ${
              activeTab === 'advisor'
                ? 'bg-black text-white border-black shadow-[2px_2px_0px_#E52521]'
                : 'bg-white text-black border-transparent hover:border-black'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Advisor</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border-2 ${
              activeTab === 'library'
                ? 'bg-black text-white border-black shadow-[2px_2px_0px_#0047AB]'
                : 'bg-white text-black border-transparent hover:border-black'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Routines Library</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border-2 ${
              activeTab === 'dashboard'
                ? 'bg-black text-white border-black shadow-[2px_2px_0px_#FFD000]'
                : 'bg-white text-black border-transparent hover:border-black'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Dashboard</span>
            <span className="ml-1 text-[10px] font-mono-numbers px-1 bg-neutral-200 text-black">
              {totalPractices}
            </span>
          </button>
        </nav>

        {/* Zone 3: Primary Action Button */}
        <div className="shrink-0">
          <button
            onClick={onOpenLogModal}
            className="destijl-btn-yellow flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Practice</span>
          </button>
        </div>
      </div>
    </header>
  );
};
